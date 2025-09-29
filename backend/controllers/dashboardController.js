import { Ticket, User, Asset } from '../models/index.js';
import { Op } from 'sequelize';

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.userType;

    let ticketWhere = {};
    
    // Filter based on user type
    if (userType !== 'it_specialist' && userType !== 'admin') {
      ticketWhere.requesterId = userId;
    }

    // Get ticket statistics
    const [
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
      highPriorityTickets,
      criticalTickets
    ] = await Promise.all([
      Ticket.count({ where: ticketWhere }),
      Ticket.count({ where: { ...ticketWhere, status: 'Open' } }),
      Ticket.count({ where: { ...ticketWhere, status: 'In Progress' } }),
      Ticket.count({ where: { ...ticketWhere, status: 'Resolved' } }),
      Ticket.count({ where: { ...ticketWhere, status: 'Closed' } }),
      Ticket.count({ where: { ...ticketWhere, priority: 'High' } }),
      Ticket.count({ where: { ...ticketWhere, priority: 'Critical' } })
    ]);

    // Get category breakdown
    const categoryStats = await Ticket.findAll({
      where: ticketWhere,
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['category'],
      raw: true
    });

    // Calculate resolution metrics
    const resolvedTicketsWithTime = await Ticket.findAll({
      where: {
        ...ticketWhere,
        status: 'Resolved',
        actualResolutionTime: { [Op.not]: null }
      },
      attributes: ['createdAt', 'actualResolutionTime']
    });

    let averageResolutionTime = 0;
    if (resolvedTicketsWithTime.length > 0) {
      const totalTime = resolvedTicketsWithTime.reduce((sum, ticket) => {
        const diff = new Date(ticket.actualResolutionTime) - new Date(ticket.createdAt);
        return sum + diff;
      }, 0);
      averageResolutionTime = Math.round(totalTime / resolvedTicketsWithTime.length / (1000 * 60 * 60)); // hours
    }

    // SLA compliance (assuming 24 hours SLA for high priority, 72 hours for others)
    let slaCompliance = 0;
    if (resolvedTicketsWithTime.length > 0) {
      const slaCompliant = resolvedTicketsWithTime.filter(ticket => {
        const resolutionHours = (new Date(ticket.actualResolutionTime) - new Date(ticket.createdAt)) / (1000 * 60 * 60);
        return resolutionHours <= 72; // Simplified SLA
      }).length;
      slaCompliance = ((slaCompliant / resolvedTicketsWithTime.length) * 100).toFixed(1);
    }

    // Asset statistics (for IT specialists)
    let assetStats = null;
    if (userType === 'it_specialist' || userType === 'admin') {
      const [totalAssets, activeAssets, maintenanceAssets] = await Promise.all([
        Asset.count(),
        Asset.count({ where: { status: 'Active' } }),
        Asset.count({ where: { status: 'Under Maintenance' } })
      ]);

      assetStats = {
        total: totalAssets,
        active: activeAssets,
        maintenance: maintenanceAssets,
        utilization: totalAssets > 0 ? ((activeAssets / totalAssets) * 100).toFixed(1) : 0
      };
    }

    res.json({
      success: true,
      data: {
        tickets: {
          total: totalTickets,
          open: openTickets,
          inProgress: inProgressTickets,
          resolved: resolvedTickets,
          closed: closedTickets,
          highPriority: highPriorityTickets,
          critical: criticalTickets
        },
        categories: categoryStats,
        performance: {
          averageResolutionTime: `${averageResolutionTime} hours`,
          slaCompliance: `${slaCompliance}%`
        },
        assets: assetStats
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getRecentActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.userType;

    let ticketWhere = {};
    
    if (userType !== 'it_specialist' && userType !== 'admin') {
      ticketWhere = {
        [Op.or]: [
          { requesterId: userId },
          { assignedToId: userId }
        ]
      };
    }

    // Get recent tickets
    const recentTickets = await Ticket.findAll({
      where: {
        ...ticketWhere,
        updatedAt: {
          [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      include: [
        { model: User, as: 'requester', attributes: ['firstName', 'lastName', 'department'] },
        { model: User, as: 'assignedTo', attributes: ['firstName', 'lastName'] }
      ],
      order: [['updatedAt', 'DESC']],
      limit: 10
    });

    // Format activity items
    const activities = recentTickets.map(ticket => ({
      id: ticket.id,
      type: 'ticket',
      action: getTicketAction(ticket),
      title: ticket.title,
      user: ticket.requester ? `${ticket.requester.firstName} ${ticket.requester.lastName}` : 'Unknown',
      department: ticket.requester?.department || 'Unknown',
      status: ticket.status,
      priority: ticket.priority,
      timestamp: ticket.updatedAt,
      category: ticket.category
    }));

    res.json({
      success: true,
      data: { activities }
    });

  } catch (error) {
    console.error('Recent activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getTicketAction = (ticket) => {
  const now = new Date();
  const updated = new Date(ticket.updatedAt);
  const created = new Date(ticket.createdAt);
  
  if (Math.abs(updated - created) < 1000) {
    return 'created';
  }
  
  switch (ticket.status) {
    case 'In Progress':
      return 'started work on';
    case 'Resolved':
      return 'resolved';
    case 'Closed':
      return 'closed';
    default:
      return 'updated';
  }
};