import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ticketService } from '../services/ticketService';
import { toast } from 'react-toastify';
import './VisitorDashboard.css';

export default function VisitorDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('myTickets');
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [comments, setComments] = useState([]);
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    category: 'software',
    priority: 'medium'
  });

  useEffect(() => {
    loadVisitorData();
  }, []);

  const loadVisitorData = async () => {
    setLoading(true);
    try {
      const [ticketsRes, statsRes] = await Promise.all([
        ticketService.getAllTickets({ created_by: user.id }),
        ticketService.getTicketStats(user.id, 'visitor')
      ]);

      console.log(' Visitor data loaded:', {
        tickets: ticketsRes.tickets?.length,
        userId: user.id
      });

      setTickets(ticketsRes.tickets || []);
      setStats(statsRes.stats);
    } catch (error) {
      console.error(' Error loading visitor data:', error);
      toast.error('Failed to load your tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();

    if (!newTicket.title.trim() || !newTicket.description.trim()) {
      toast.warning(' Please fill in all fields');
      return;
    }

    try {
      await ticketService.createTicket({
        ...newTicket,
        created_by: user.id
      });

      toast.success(' Ticket created successfully!');
      setShowCreateModal(false);
      setNewTicket({
        title: '',
        description: '',
        category: 'software',
        priority: 'medium'
      });
      loadVisitorData();
    } catch (error) {
      console.error('Create ticket error:', error);
      toast.error('Failed to create ticket');
    }
  };

  const viewTicketDetails = async (ticketId) => {
    try {
      const [ticketRes, commentsRes] = await Promise.all([
        ticketService.getTicketById(ticketId),
        ticketService.getComments(ticketId)
      ]);
      
      setSelectedTicket(ticketRes.ticket);
      setComments(commentsRes.comments || []);
      setShowTicketModal(true);
    } catch (error) {
      toast.error('Failed to load ticket details');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      open: '#3B82F6',
      in_progress: '#F59E0B',
      resolved: '#10B981',
      closed: '#6B7280'
    };
    return colors[status] || '#6B7280';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#10B981',
      medium: '#F59E0B',
      high: '#EF4444',
      urgent: '#DC2626'
    };
    return colors[priority] || '#6B7280';
  };

  if (loading) {
    return (
      <div className="visitor-dashboard loading">
        <div className="spinner-large"></div>
        <p>Loading your tickets...</p>
      </div>
    );
  }

  return (
    <div className="visitor-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1> Visitor Dashboard</h1>
            <p>Welcome, {user?.first_name}!</p>
          </div>
          <div className="header-right">
            <button className="create-ticket-btn" onClick={() => setShowCreateModal(true)}>
               Create Ticket
            </button>
            <button className="refresh-btn" onClick={loadVisitorData}>
               Refresh
            </button>
            <button className="logout-btn" onClick={logout}>
               Logout
            </button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-content">
            <h3>My Tickets</h3>
            <p className="stat-number">{stats?.total || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-content">
            <h3>Open</h3>
            <p className="stat-number" style={{ color: '#3B82F6' }}>
              {stats?.byStatus?.open || 0}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-content">
            <h3>In Progress</h3>
            <p className="stat-number" style={{ color: '#F59E0B' }}>
              {stats?.byStatus?.in_progress || 0}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-content">
            <h3>Resolved</h3>
            <p className="stat-number" style={{ color: '#10B981' }}>
              {stats?.byStatus?.resolved || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Tickets Section */}
      <div className="tickets-section">
        <div className="section-header">
          <h2> My Tickets</h2>
          <button className="create-btn-inline" onClick={() => setShowCreateModal(true)}>
             New Ticket
          </button>
        </div>
        
        {tickets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"></div>
            <h3>No tickets yet</h3>
            <p>Create your first ticket to get help</p>
            <button className="create-first-btn" onClick={() => setShowCreateModal(true)}>
               Create Your First Ticket
            </button>
          </div>
        ) : (
          <div className="tickets-grid">
            {tickets.map(ticket => (
              <div key={ticket.id} className="ticket-card">
                <div className="ticket-header">
                  <h3>{ticket.title}</h3>
                  <span 
                    className="priority-badge"
                    style={{ backgroundColor: getPriorityColor(ticket.priority) }}
                  >
                    {ticket.priority}
                  </span>
                </div>
                
                <p className="ticket-description">{ticket.description}</p>
                
                <div className="ticket-meta">
                  <span className="category-badge">{ticket.category}</span>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(ticket.status) }}
                  >
                    {ticket.status}
                  </span>
                </div>
                
                {ticket.assignee && (
                  <div className="assigned-info">
                    <span> Assigned to: {ticket.assignee.first_name} {ticket.assignee.last_name}</span>
                  </div>
                )}
                
                <div className="ticket-footer">
                  <span className="ticket-date">
                     {new Date(ticket.created_at).toLocaleDateString()}
                  </span>
                  <button 
                    className="view-details-btn"
                    onClick={() => viewTicketDetails(ticket.id)}
                  >
                    View Details 
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2> Create New Ticket</h2>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}></button>
            </div>
            
            <form onSubmit={handleCreateTicket} className="create-ticket-form">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                  placeholder="Brief description of the issue"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  placeholder="Detailed description of the problem"
                  rows="5"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                  >
                    <option value="hardware">Hardware</option>
                    <option value="software">Software</option>
                    <option value="network">Network</option>
                    <option value="access">Access</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Priority *</label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Details Modal */}
      {showTicketModal && selectedTicket && (
        <div className="modal-overlay" onClick={() => setShowTicketModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2> Ticket Details</h2>
              <button className="close-btn" onClick={() => setShowTicketModal(false)}></button>
            </div>
            
            <div className="modal-body">
              {/* Ticket Info */}
              <div className="ticket-info-section">
                <div className="info-row">
                  <strong>Title:</strong>
                  <span>{selectedTicket.title}</span>
                </div>
                
                <div className="info-row">
                  <strong>Description:</strong>
                  <p>{selectedTicket.description}</p>
                </div>
                
                <div className="info-row">
                  <strong>Category:</strong>
                  <span className="category-badge">{selectedTicket.category}</span>
                </div>
                
                <div className="info-row">
                  <strong>Priority:</strong>
                  <span 
                    className="priority-badge"
                    style={{ backgroundColor: getPriorityColor(selectedTicket.priority) }}
                  >
                    {selectedTicket.priority}
                  </span>
                </div>
                
                <div className="info-row">
                  <strong>Status:</strong>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(selectedTicket.status) }}
                  >
                    {selectedTicket.status}
                  </span>
                </div>
                
                {selectedTicket.assignee && (
                  <div className="info-row">
                    <strong>Assigned To:</strong>
                    <span>
                      {selectedTicket.assignee.first_name} {selectedTicket.assignee.last_name}
                    </span>
                  </div>
                )}
                
                <div className="info-row">
                  <strong>Created:</strong>
                  <span>{new Date(selectedTicket.created_at).toLocaleString()}</span>
                </div>
              </div>

              {/* Comments Section */}
              <div className="comments-section">
                <h3> Updates & Comments ({comments.length})</h3>
                
                <div className="comments-list">
                  {comments.length === 0 ? (
                    <p className="no-comments">No updates yet. We'll notify you when there's progress!</p>
                  ) : (
                    comments.map(comment => (
                      <div key={comment.id} className="comment-item">
                        <div className="comment-header">
                          <strong>
                            {comment.user ? 
                              `${comment.user.first_name} ${comment.user.last_name}` : 
                              'System'
                            }
                          </strong>
                          <span className="comment-date">
                            {new Date(comment.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="comment-text">{comment.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
