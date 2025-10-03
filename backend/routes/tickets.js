const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all tickets with advanced filtering
router.get('/', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 25,
            sortBy = 'createdAt',
            order = 'desc',
            status,
            priority,
            department,
            assignee,
            search,
            includeDetails = false
        } = req.query;

        let query = `
            SELECT t.*, 
                   u.firstName as userName, u.lastName as userLastName, u.email as userEmail,
                   u.department as userDepartment,
                   a.firstName as assigneeName, a.lastName as assigneeLastName
            FROM Tickets t
            LEFT JOIN Users u ON t.userId = u.id
            LEFT JOIN Users a ON t.assignedTo = a.id
            WHERE 1=1
        `;
        
        const params = [];

        // Apply filters
        if (status && status !== 'all') {
            query += ' AND t.status = ?';
            params.push(status);
        }

        if (priority && priority !== 'all') {
            query += ' AND t.priority = ?';
            params.push(priority);
        }

        if (department && department !== 'all') {
            query += ' AND u.department = ?';
            params.push(department);
        }

        if (assignee && assignee !== 'all') {
            query += ' AND t.assignedTo = ?';
            params.push(assignee);
        }

        if (search) {
            query += ' AND (t.title LIKE ? OR t.description LIKE ? OR t.ticketId LIKE ?)';
            const searchParam = `%${search}%`;
            params.push(searchParam, searchParam, searchParam);
        }

        // Add sorting
        const validSortFields = ['createdAt', 'updatedAt', 'priority', 'status', 'title'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
        const sortOrder = order === 'asc' ? 'ASC' : 'DESC';
        query += ` ORDER BY t.${sortField} ${sortOrder}`;

        // Add pagination
        const offset = (page - 1) * limit;
        query += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [tickets] = await db.execute(query, params);

        // Get total count for pagination
        let countQuery = `
            SELECT COUNT(*) as total
            FROM Tickets t
            LEFT JOIN Users u ON t.userId = u.id
            WHERE 1=1
        `;
        const countParams = params.slice(0, -2); // Remove limit and offset

        if (status && status !== 'all') {
            countQuery += ' AND t.status = ?';
        }
        if (priority && priority !== 'all') {
            countQuery += ' AND t.priority = ?';
        }
        if (department && department !== 'all') {
            countQuery += ' AND u.department = ?';
        }
        if (assignee && assignee !== 'all') {
            countQuery += ' AND t.assignedTo = ?';
        }
        if (search) {
            countQuery += ' AND (t.title LIKE ? OR t.description LIKE ? OR t.ticketId LIKE ?)';
        }

        const [countResult] = await db.execute(countQuery, countParams);
        const total = countResult[0].total;

        // Format tickets data
        const formattedTickets = tickets.map(ticket => ({
            ...ticket,
            userName: `${ticket.userName} ${ticket.userLastName}`,
            assigneeName: ticket.assigneeName ? `${ticket.assigneeName} ${ticket.assigneeLastName}` : null,
            department: ticket.userDepartment,
            escalated: isTicketOverdue(ticket)
        }));

        res.json({
            success: true,
            data: {
                tickets: formattedTickets,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tickets'
        });
    }
});

// Get single ticket with details
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [tickets] = await db.execute(`
            SELECT t.*, 
                   u.firstName as userName, u.lastName as userLastName, u.email as userEmail,
                   u.department as userDepartment, u.phoneNumber as userPhone,
                   a.firstName as assigneeName, a.lastName as assigneeLastName
            FROM Tickets t
            LEFT JOIN Users u ON t.userId = u.id
            LEFT JOIN Users a ON t.assignedTo = a.id
            WHERE t.id = ?
        `, [id]);

        if (tickets.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }

        // Get ticket comments/activity
        const [comments] = await db.execute(`
            SELECT c.*, u.firstName, u.lastName, u.role
            FROM TicketComments c
            LEFT JOIN Users u ON c.userId = u.id
            WHERE c.ticketId = ?
            ORDER BY c.createdAt ASC
        `, [id]);

        const ticket = {
            ...tickets[0],
            userName: `${tickets[0].userName} ${tickets[0].userLastName}`,
            assigneeName: tickets[0].assigneeName ? `${tickets[0].assigneeName} ${tickets[0].assigneeLastName}` : null,
            department: tickets[0].userDepartment,
            comments: comments.map(comment => ({
                ...comment,
                authorName: `${comment.firstName} ${comment.lastName}`
            }))
        };

        res.json({
            success: true,
            data: { ticket }
        });

    } catch (error) {
        console.error('Error fetching ticket:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch ticket details'
        });
    }
});

// Update ticket status
router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reason = '' } = req.body;

        const validStatuses = ['submitted', 'under_review', 'in_progress', 'resolved', 'closed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        // Update ticket status
        await db.execute(`
            UPDATE Tickets 
            SET status = ?, updatedAt = NOW() 
            WHERE id = ?
        `, [status, id]);

        // Add activity log
        await db.execute(`
            INSERT INTO TicketComments (ticketId, userId, comment, type, createdAt)
            VALUES (?, ?, ?, 'system', NOW())
        `, [id, req.user?.userId || 1, `Status changed to ${status}. ${reason ? 'Reason: ' + reason : ''}`]);

        res.json({
            success: true,
            message: 'Ticket status updated successfully'
        });

    } catch (error) {
        console.error('Error updating ticket status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update ticket status'
        });
    }
});

// Add comment to ticket
router.post('/:id/comments', async (req, res) => {
    try {
        const { id } = req.params;
        const { comment, type = 'user' } = req.body;

        if (!comment || !comment.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Comment is required'
            });
        }

        await db.execute(`
            INSERT INTO TicketComments (ticketId, userId, comment, type, createdAt)
            VALUES (?, ?, ?, ?, NOW())
        `, [id, req.user?.userId || 1, comment.trim(), type]);

        // Update ticket's updatedAt
        await db.execute(`
            UPDATE Tickets SET updatedAt = NOW() WHERE id = ?
        `, [id]);

        res.json({
            success: true,
            message: 'Comment added successfully'
        });

    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add comment'
        });
    }
});

// Bulk update tickets
router.patch('/bulk', async (req, res) => {
    try {
        const { ticketIds, action, data } = req.body;

        if (!ticketIds || !Array.isArray(ticketIds) || ticketIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Ticket IDs are required'
            });
        }

        const placeholders = ticketIds.map(() => '?').join(',');
        
        switch (action) {
            case 'change_status':
                if (!data.status) {
                    return res.status(400).json({
                        success: false,
                        message: 'Status is required for bulk status change'
                    });
                }
                
                await db.execute(`
                    UPDATE Tickets 
                    SET status = ?, updatedAt = NOW() 
                    WHERE id IN (${placeholders})
                `, [data.status, ...ticketIds]);
                break;

            case 'assign':
                if (!data.assigneeId) {
                    return res.status(400).json({
                        success: false,
                        message: 'Assignee ID is required for bulk assignment'
                    });
                }
                
                await db.execute(`
                    UPDATE Tickets 
                    SET assignedTo = ?, updatedAt = NOW() 
                    WHERE id IN (${placeholders})
                `, [data.assigneeId, ...ticketIds]);
                break;

            case 'set_priority':
                if (!data.priority) {
                    return res.status(400).json({
                        success: false,
                        message: 'Priority is required for bulk priority change'
                    });
                }
                
                await db.execute(`
                    UPDATE Tickets 
                    SET priority = ?, updatedAt = NOW() 
                    WHERE id IN (${placeholders})
                `, [data.priority, ...ticketIds]);
                break;

            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid bulk action'
                });
        }

        res.json({
            success: true,
            message: `Bulk action applied to ${ticketIds.length} tickets`
        });

    } catch (error) {
        console.error('Error performing bulk action:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to perform bulk action'
        });
    }
});

// Helper function to check if ticket is overdue
function isTicketOverdue(ticket) {
    if (!ticket.createdAt || ticket.status === 'closed') return false;
    
    const created = new Date(ticket.createdAt);
    const now = new Date();
    const hoursDiff = (now - created) / (1000 * 60 * 60);
    
    const priorityHours = {
        'low': 72,
        'medium': 24,
        'high': 4,
        'critical': 1
    };
    
    const escalationHours = priorityHours[ticket.priority] || 24;
    return hoursDiff > escalationHours;
}

module.exports = router;