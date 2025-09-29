import { validationResult } from 'express-validator';
import { Ticket, User } from '../models/index.js';
import { Op } from 'sequelize';

export const createTicket = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      title,
      description,
      category,
      subcategory,
      priority = 'Medium',
      urgency = 'Medium',
      impact = 'Medium',
      assetTag,
      location
    } = req.body;

    const ticket = await Ticket.create({
      title,
      description,
      category,
      subcategory,
      priority,
      urgency,
      impact,
      requesterId: req.user.id,
      assetTag,
      location: location || `${req.user.deskNumber} - ${req.user.department}`
    });

    // Fetch the created ticket with associations
    const createdTicket = await Ticket.findByPk(ticket.id, {
      include: [
        { model: User, as: 'requester', attributes: ['id', 'firstName', 'lastName', 'email', 'department'] },
        { model: User, as: 'assignedTo', attributes: ['id', 'firstName', 'lastName', 'email'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      data: { ticket: createdTicket }
    });

  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getTickets = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      priority,
      assignedTo,
      requester
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // Build filter conditions
    if (status) where.status = status;
    if (category) where.category = category;
    if (priority) where.priority = priority;
    if (assignedTo) where.assignedToId = assignedTo;
    if (requester) where.requesterId = requester;

    // If user is not IT specialist, only show their tickets
    if (req.user.userType !== 'it_specialist' && req.user.userType !== 'admin') {
      where.requesterId = req.user.id;
    }

    const { rows: tickets, count: total } = await Ticket.findAndCountAll({
      where,
      include: [
        { model: User, as: 'requester', attributes: ['id', 'firstName', 'lastName', 'email', 'department'] },
        { model: User, as: 'assignedTo', attributes: ['id', 'firstName', 'lastName', 'email'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.json({
      success: true,
      data: {
        tickets,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findByPk(id, {
      include: [
        { model: User, as: 'requester', attributes: ['id', 'firstName', 'lastName', 'email', 'department', 'deskNumber'] },
        { model: User, as: 'assignedTo', attributes: ['id', 'firstName', 'lastName', 'email'] }
      ]
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check permissions
    if (req.user.userType !== 'it_specialist' && 
        req.user.userType !== 'admin' && 
        ticket.requesterId !== req.user.id && 
        ticket.assignedToId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { ticket }
    });

  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      category,
      subcategory,
      priority,
      status,
      resolutionNotes
    } = req.body;

    const ticket = await Ticket.findByPk(id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check permissions
    if (req.user.userType !== 'it_specialist' && 
        req.user.userType !== 'admin' && 
        ticket.requesterId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const updateData = {
      title,
      description,
      category,
      subcategory,
      priority,
      status,
      resolutionNotes
    };

    // Set resolution time if ticket is being resolved
    if (status === 'Resolved' && ticket.status !== 'Resolved') {
      updateData.actualResolutionTime = new Date();
    }

    await ticket.update(updateData);

    const updatedTicket = await Ticket.findByPk(id, {
      include: [
        { model: User, as: 'requester', attributes: ['id', 'firstName', 'lastName', 'email', 'department'] },
        { model: User, as: 'assignedTo', attributes: ['id', 'firstName', 'lastName', 'email'] }
      ]
    });

    res.json({
      success: true,
      message: 'Ticket updated successfully',
      data: { ticket: updatedTicket }
    });

  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findByPk(id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Only ticket creator or admin can delete
    if (ticket.requesterId !== req.user.id && req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await ticket.destroy();

    res.json({
      success: true,
      message: 'Ticket deleted successfully'
    });

  } catch (error) {
    console.error('Delete ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const assignTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedToId } = req.body;

    // Only IT specialists and admins can assign tickets
    if (req.user.userType !== 'it_specialist' && req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const ticket = await Ticket.findByPk(id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Verify assignee is IT specialist
    if (assignedToId) {
      const assignee = await User.findByPk(assignedToId);
      if (!assignee || (assignee.userType !== 'it_specialist' && assignee.userType !== 'admin')) {
        return res.status(400).json({
          success: false,
          message: 'Can only assign tickets to IT specialists'
        });
      }
    }

    await ticket.update({
      assignedToId: assignedToId || null,
      status: assignedToId ? 'In Progress' : 'Open'
    });

    const updatedTicket = await Ticket.findByPk(id, {
      include: [
        { model: User, as: 'requester', attributes: ['id', 'firstName', 'lastName', 'email', 'department'] },
        { model: User, as: 'assignedTo', attributes: ['id', 'firstName', 'lastName', 'email'] }
      ]
    });

    res.json({
      success: true,
      message: 'Ticket assigned successfully',
      data: { ticket: updatedTicket }
    });

  } catch (error) {
    console.error('Assign ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const closeTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolutionNotes, satisfactionRating, feedbackComments } = req.body;

    const ticket = await Ticket.findByPk(id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check permissions
    if (req.user.userType !== 'it_specialist' && 
        req.user.userType !== 'admin' && 
        ticket.requesterId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await ticket.update({
      status: 'Closed',
      resolutionNotes,
      satisfactionRating,
      feedbackComments,
      actualResolutionTime: ticket.actualResolutionTime || new Date()
    });

    const updatedTicket = await Ticket.findByPk(id, {
      include: [
        { model: User, as: 'requester', attributes: ['id', 'firstName', 'lastName', 'email', 'department'] },
        { model: User, as: 'assignedTo', attributes: ['id', 'firstName', 'lastName', 'email'] }
      ]
    });

    res.json({
      success: true,
      message: 'Ticket closed successfully',
      data: { ticket: updatedTicket }
    });

  } catch (error) {
    console.error('Close ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};