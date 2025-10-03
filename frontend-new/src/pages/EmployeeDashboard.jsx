import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ticketService } from '../services/ticketService';
import { toast } from 'react-toastify';
import './EmployeeDashboard.css';

export default function EmployeeDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('myTickets');
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    priority: ''
  });

  useEffect(() => {
    loadEmployeeData();
  }, []);

  const loadEmployeeData = async () => {
    setLoading(true);
    try {
      // Get tickets assigned to this employee
      const response = await ticketService.getAllTickets({
        assigned_to: user.id,
        ...filters
      });
      
      const statsRes = await ticketService.getTicketStats(user.id, 'employee');

      console.log(' Employee data loaded:', {
        tickets: response.tickets?.length,
        userId: user.id
      });

      setTickets(response.tickets || []);
      setStats(statsRes.stats);
    } catch (error) {
      console.error(' Error loading employee data:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = async () => {
    setLoading(true);
    try {
      const response = await ticketService.getAllTickets({
        assigned_to: user.id,
        ...filters
      });
      setTickets(response.tickets || []);
      toast.success(' Filters applied!');
    } catch (error) {
      toast.error('Failed to apply filters');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({ status: '', priority: '' });
    loadEmployeeData();
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

  const handleUpdateStatus = async (newStatus) => {
    try {
      await ticketService.updateTicket(selectedTicket.id, { status: newStatus });
      toast.success(` Status updated to ${newStatus}!`);
      setSelectedTicket({ ...selectedTicket, status: newStatus });
      loadEmployeeData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.warning(' Comment cannot be empty');
      return;
    }

    try {
      await ticketService.addComment(selectedTicket.id, user.id, newComment);
      toast.success(' Comment added!');
      
      // Reload comments
      const commentsRes = await ticketService.getComments(selectedTicket.id);
      setComments(commentsRes.comments || []);
      setNewComment('');
    } catch (error) {
      toast.error('Failed to add comment');
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
      <div className="employee-dashboard loading">
        <div className="spinner-large"></div>
        <p>Loading your tickets...</p>
      </div>
    );
  }

  return (
    <div className="employee-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1> Employee Dashboard</h1>
            <p>Welcome, {user?.first_name}!</p>
          </div>
          <div className="header-right">
            <button className="refresh-btn" onClick={loadEmployeeData}>
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
            <h3>Assigned Tickets</h3>
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

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-bar">
          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          <select name="priority" value={filters.priority} onChange={handleFilterChange}>
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

          <button className="apply-btn" onClick={applyFilters}>Apply</button>
          <button className="clear-btn" onClick={clearFilters}>Clear</button>
        </div>
      </div>

      {/* Tickets Section */}
      <div className="tickets-section">
        <h2> My Assigned Tickets</h2>
        
        {tickets.length === 0 ? (
          <div className="empty-state">
            <p> No tickets assigned yet!</p>
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
                  <strong>Current Status:</strong>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(selectedTicket.status) }}
                  >
                    {selectedTicket.status}
                  </span>
                </div>
                
                <div className="info-row">
                  <strong>Created By:</strong>
                  <span>
                    {selectedTicket.creator ? 
                      `${selectedTicket.creator.first_name} ${selectedTicket.creator.last_name}` : 
                      'Unknown'
                    }
                  </span>
                </div>
                
                <div className="info-row">
                  <strong>Created:</strong>
                  <span>{new Date(selectedTicket.created_at).toLocaleString()}</span>
                </div>
              </div>

              {/* Status Update */}
              <div className="status-update-section">
                <h3> Update Status</h3>
                <div className="status-buttons">
                  <button 
                    className={`status-btn ${selectedTicket.status === 'open' ? 'active' : ''}`}
                    onClick={() => handleUpdateStatus('open')}
                    disabled={selectedTicket.status === 'open'}
                  >
                     Open
                  </button>
                  <button 
                    className={`status-btn ${selectedTicket.status === 'in_progress' ? 'active' : ''}`}
                    onClick={() => handleUpdateStatus('in_progress')}
                    disabled={selectedTicket.status === 'in_progress'}
                  >
                     In Progress
                  </button>
                  <button 
                    className={`status-btn ${selectedTicket.status === 'resolved' ? 'active' : ''}`}
                    onClick={() => handleUpdateStatus('resolved')}
                    disabled={selectedTicket.status === 'resolved'}
                  >
                     Resolved
                  </button>
                  <button 
                    className={`status-btn ${selectedTicket.status === 'closed' ? 'active' : ''}`}
                    onClick={() => handleUpdateStatus('closed')}
                    disabled={selectedTicket.status === 'closed'}
                  >
                     Closed
                  </button>
                </div>
              </div>

              {/* Comments Section */}
              <div className="comments-section">
                <h3> Comments ({comments.length})</h3>
                
                <div className="comments-list">
                  {comments.length === 0 ? (
                    <p className="no-comments">No comments yet. Be the first to comment!</p>
                  ) : (
                    comments.map(comment => (
                      <div key={comment.id} className="comment-item">
                        <div className="comment-header">
                          <strong>
                            {comment.user ? 
                              `${comment.user.first_name} ${comment.user.last_name}` : 
                              'Unknown User'
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

                {/* Add Comment */}
                <div className="add-comment-section">
                  <textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows="3"
                  />
                  <button className="add-comment-btn" onClick={handleAddComment}>
                     Add Comment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
