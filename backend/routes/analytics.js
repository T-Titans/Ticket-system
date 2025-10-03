const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get dashboard analytics
router.get('/dashboard', async (req, res) => {
    try {
        // Get total tickets
        const [totalResult] = await db.execute('SELECT COUNT(*) as total FROM Tickets');
        const totalTickets = totalResult[0].total;

        // Get open tickets
        const [openResult] = await db.execute(`
            SELECT COUNT(*) as total FROM Tickets 
            WHERE status NOT IN ('closed', 'resolved')
        `);
        const openTickets = openResult[0].total;

        // Get overdue tickets
        const [overdueResult] = await db.execute(`
            SELECT COUNT(*) as total FROM Tickets 
            WHERE status NOT IN ('closed', 'resolved') 
            AND (
                (priority = 'critical' AND createdAt < DATE_SUB(NOW(), INTERVAL 1 HOUR)) OR
                (priority = 'high' AND createdAt < DATE_SUB(NOW(), INTERVAL 4 HOUR)) OR
                (priority = 'medium' AND createdAt < DATE_SUB(NOW(), INTERVAL 24 HOUR)) OR
                (priority = 'low' AND createdAt < DATE_SUB(NOW(), INTERVAL 72 HOUR))
            )
        `);
        const overdueTickets = overdueResult[0].total;

        // Get tickets by status
        const [statusResult] = await db.execute(`
            SELECT status, COUNT(*) as count 
            FROM Tickets 
            GROUP BY status
        `);
        const ticketsByStatus = {};
        statusResult.forEach(row => {
            ticketsByStatus[row.status] = row.count;
        });

        // Get tickets by priority
        const [priorityResult] = await db.execute(`
            SELECT priority, COUNT(*) as count 
            FROM Tickets 
            GROUP BY priority
        `);
        const ticketsByPriority = {};
        priorityResult.forEach(row => {
            ticketsByPriority[row.priority] = row.count;
        });

        // Calculate average resolution time
        const [avgResult] = await db.execute(`
            SELECT AVG(TIMESTAMPDIFF(HOUR, createdAt, updatedAt)) as avgHours
            FROM Tickets 
            WHERE status = 'resolved'
        `);
        const avgHours = avgResult[0].avgHours || 0;
        const avgResolutionTime = avgHours > 24 ? `${Math.round(avgHours / 24)}d` : `${Math.round(avgHours)}h`;

        // Get recent activity
        const [activityResult] = await db.execute(`
            SELECT t.title, t.status, t.updatedAt, u.firstName, u.lastName
            FROM Tickets t
            LEFT JOIN Users u ON t.userId = u.id
            ORDER BY t.updatedAt DESC
            LIMIT 10
        `);

        const recentActivity = activityResult.map(item => ({
            ...item,
            userName: `${item.firstName} ${item.lastName}`
        }));

        res.json({
            success: true,
            data: {
                totalTickets,
                openTickets,
                overdueTickets,
                avgResolutionTime,
                satisfactionScore: 4.2, // This would come from actual feedback data
                ticketsByStatus,
                ticketsByPriority,
                recentActivity
            }
        });

    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch analytics data'
        });
    }
});

module.exports = router;