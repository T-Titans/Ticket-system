const supabase = require('../config/supabase');

// Get all tickets with filters
const getAllTickets = async (req, res) => {
  try {
    const { status, priority, category, assigned_to, created_by } = req.query;

    let query = supabase
      .from('tickets')
      .select(`
        *,
        creator:created_by(id, first_name, last_name, email, role),
        assignee:assigned_to(id, first_name, last_name, email, role)
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (priority) {
      query = query.eq('priority', priority);
    }
    if (category) {
      query = query.eq('category', category);
    }
    if (assigned_to) {
      query = query.eq('assigned_to', assigned_to);
    }
    if (created_by) {
      query = query.eq('created_by', created_by);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      tickets: data,
      count: data.length
    });
  } catch (error) {
    console.error(' Error fetching tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tickets',
      error: error.message
    });
  }
};

// Get ticket by ID
const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('tickets')
      .select(`
        *,
        creator:created_by(id, first_name, last_name, email, role),
        assignee:assigned_to(id, first_name, last_name, email, role)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    res.json({
      success: true,
      ticket: data
    });
  } catch (error) {
    console.error(' Error fetching ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ticket',
      error: error.message
    });
  }
};

// Create ticket
const createTicket = async (req, res) => {
  try {
    const { title, description, category, priority, created_by } = req.body;

    // Validation
    if (!title || !description || !category || !priority || !created_by) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const { data, error } = await supabase
      .from('tickets')
      .insert([{
        title,
        description,
        category,
        priority,
        created_by,
        status: 'open'
      }])
      .select(`
        *,
        creator:created_by(id, first_name, last_name, email, role)
      `)
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      ticket: data
    });
  } catch (error) {
    console.error(' Error creating ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create ticket',
      error: error.message
    });
  }
};

// Update ticket
const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.id;
    delete updates.created_by;
    delete updates.created_at;

    const { data, error } = await supabase
      .from('tickets')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        creator:created_by(id, first_name, last_name, email, role),
        assignee:assigned_to(id, first_name, last_name, email, role)
      `)
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: 'Ticket updated successfully',
      ticket: data
    });
  } catch (error) {
    console.error(' Error updating ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update ticket',
      error: error.message
    });
  }
};

// Assign ticket
const assignTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to } = req.body;

    if (!assigned_to) {
      return res.status(400).json({
        success: false,
        message: 'assigned_to is required'
      });
    }

    const { data, error } = await supabase
      .from('tickets')
      .update({ 
        assigned_to,
        status: 'in_progress'
      })
      .eq('id', id)
      .select(`
        *,
        creator:created_by(id, first_name, last_name, email, role),
        assignee:assigned_to(id, first_name, last_name, email, role)
      `)
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: 'Ticket assigned successfully',
      ticket: data
    });
  } catch (error) {
    console.error(' Error assigning ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign ticket',
      error: error.message
    });
  }
};

// Delete ticket
const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;

    // First delete comments
    await supabase
      .from('ticket_comments')
      .delete()
      .eq('ticket_id', id);

    // Then delete ticket
    const { error } = await supabase
      .from('tickets')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Ticket deleted successfully'
    });
  } catch (error) {
    console.error(' Error deleting ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete ticket',
      error: error.message
    });
  }
};

// Get ticket statistics
const getTicketStats = async (req, res) => {
  try {
    const { user_id, role } = req.query;

    let query = supabase.from('tickets').select('*');

    // Filter based on role
    if (role === 'employee' && user_id) {
      query = query.eq('assigned_to', user_id);
    } else if (role === 'visitor' && user_id) {
      query = query.eq('created_by', user_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Calculate stats
    const stats = {
      total: data.length,
      byStatus: {
        open: data.filter(t => t.status === 'open').length,
        in_progress: data.filter(t => t.status === 'in_progress').length,
        resolved: data.filter(t => t.status === 'resolved').length,
        closed: data.filter(t => t.status === 'closed').length
      },
      byPriority: {
        low: data.filter(t => t.priority === 'low').length,
        medium: data.filter(t => t.priority === 'medium').length,
        high: data.filter(t => t.priority === 'high').length,
        urgent: data.filter(t => t.priority === 'urgent').length
      },
      byCategory: {
        hardware: data.filter(t => t.category === 'hardware').length,
        software: data.filter(t => t.category === 'software').length,
        network: data.filter(t => t.category === 'network').length,
        access: data.filter(t => t.category === 'access').length,
        other: data.filter(t => t.category === 'other').length
      }
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error(' Error getting ticket stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get ticket statistics',
      error: error.message
    });
  }
};

// Add comment to ticket
const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, comment } = req.body;

    if (!user_id || !comment) {
      return res.status(400).json({
        success: false,
        message: 'user_id and comment are required'
      });
    }

    const { data, error } = await supabase
      .from('ticket_comments')
      .insert([{
        ticket_id: id,
        user_id,
        comment
      }])
      .select(`
        *,
        user:user_id(id, first_name, last_name, email)
      `)
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: data
    });
  } catch (error) {
    console.error(' Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: error.message
    });
  }
};

// Get comments for ticket
const getComments = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('ticket_comments')
      .select(`
        *,
        user:user_id(id, first_name, last_name, email)
      `)
      .eq('ticket_id', id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      comments: data
    });
  } catch (error) {
    console.error(' Error fetching comments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comments',
      error: error.message
    });
  }
};

module.exports = {
  getAllTickets,
  getTicketById,
  createTicket,
  updateTicket,
  assignTicket,
  deleteTicket,
  getTicketStats,
  addComment,
  getComments
};
