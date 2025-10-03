import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ticketService } from '../services/ticketService';
import { userService } from '../services/userService';
import { toast } from 'react-toastify';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignTicketId, setAssignTicketId] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: ''
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [ticketsRes, usersRes, statsRes, userStatsRes] = await Promise.all([
        ticketService.getAllTickets(filters),
        userService.getAllUsers(),
        ticketService.getTicketStats(),
        userService.getUserStats()
      ]);

      console.log(' Dashboard data loaded:', {
        tickets: ticketsRes.tickets?.length,
        users: usersRes.users?.length
      });

      setTickets(ticketsRes.tickets || []);
      setUsers(usersRes.users || []);
      setStats(statsRes.stats);
      setUserStats(userStatsRes.stats);
    } catch (error) {
      console.error(' Error loading dashboard:', error);
      toast.error('Failed to load dashboard data');
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
      const response = await ticketService.getAllTickets(filters);
      setTickets(response.tickets || []);
      toast.success(' Filters applied!');
    } catch (error) {
      toast.error('Failed to apply filters');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = async () => {
    setFilters({ status: '', priority: '', category: '' });
    setLoading(true);
    try {
      const response = await ticketService.getAllTickets({});
      setTickets(response.tickets || []);
      toast.success(' Filters cleared!');
    } catch (error) {
      toast.error('Failed to clear filters');
    } finally {
      setLoading(false);
    }
  };

  const viewTicketDetails = async (ticketId) => {
    try {
      const response = await ticketService.getTicketById(ticketId);
      setSelectedTicket(response.ticket);
      setShowTicketModal(true);
    } catch (error) {
      toast.error('Failed to load ticket details');
    }
  };

  const openAssignModal = (ticketId) => {
    setAssignTicketId(ticketId);
    setShowAssignModal(true);
  };

  const handleAssignTicket = async (employeeId) => {
    try {
      await ticketService.assignTicket(assignTicketId, employeeId);
      toast.success(' Ticket assigned successfully!');
      setShowAssignModal(false);
      setAssignTicketId(null);
      loadDashboardData();
    } catch (error) {
      toast.error('Failed to assign ticket');
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!window.confirm(' Delete this ticket permanently?')) return;

    try {
      await ticketService.deleteTicket(ticketId);
      toast.success(' Ticket deleted!');
      loadDashboardData();
    } catch (error) {
      toast.error('Failed to delete ticket');
    }
  };

  const handleUpdateTicketStatus = async (ticketId, newStatus) => {
    try {
      await ticketService.updateTicket(ticketId, { status: newStatus });
      toast.success(` Status updated to ${newStatus}!`);
      setShowTicketModal(false);
      loadDashboardData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm(' Delete this user permanently?')) return;

    try {
      await userService.deleteUser(userId);
      toast.success(' User deleted!');
      loadDashboardData();
    } catch (error) {
      toast.error('Failed to delete user');
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
      <div className="admin-dashboard loading">
        <div className="spinner-large"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1> Admin Dashboard</h1>
            <p>Welcome back, {user?.first_name}!</p>
          </div>
          <div className="header-right">
            <button className="refresh-btn" onClick={loadDashboardData}>
               Refresh
            </button>
            <button className="logout-btn" onClick={logout}>
               Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
           Overview
        </button>
        <button 
          className={`tab ${activeTab === 'tickets' ? 'active' : ''}`}
          onClick={() => setActiveTab('tickets')}
        >
           Tickets ({tickets.length})
        </button>
        <button 
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
           Users ({users.length})
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="overview-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon"></div>
              <div className="stat-content">
                <h3>Total Tickets</h3>
                <p className="stat-number">{stats?.total || 0}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon"></div>
              <div className="stat-content">
                <h3>Open Tickets</h3>
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

            <div className="stat-card">
              <div className="stat-icon"></div>
              <div className="stat-content">
                <h3>Total Users</h3>
                <p className="stat-number">{userStats?.total || 0}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon"></div>
              <div className="stat-content">
                <h3>Urgent Tickets</h3>
                <p className="stat-number" style={{ color: '#DC2626' }}>
                  {stats?.byPriority?.urgent || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Priority Distribution */}
          <div className="priority-distribution">
            <h3> Tickets by Priority</h3>
            <div className="priority-bars">
              {Object.entries(stats?.byPriority || {}).map(([priority, count]) => (
                <div key={priority} className="priority-bar-item">
                  <span className="priority-label">{priority}</span>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${(count / stats?.total * 100) || 0}%`,
                        backgroundColor: getPriorityColor(priority)
                      }}
                    ></div>
                  </div>
                  <span className="priority-count">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tickets Tab */}
      {activeTab === 'tickets' && (
        <div className="tickets-section">
          {/* Filters */}
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

            <select name="category" value={filters.category} onChange={handleFilterChange}>
              <option value="">All Categories</option>
              <option value="hardware">Hardware</option>
              <option value="software">Software</option>
              <option value="network">Network</option>
              <option value="access">Access</option>
              <option value="other">Other</option>
            </select>

            <button className="apply-btn" onClick={applyFilters}>Apply</button>
            <button className="clear-btn" onClick={clearFilters}>Clear</button>
          </div>

          {/* Tickets Table */}
          <div className="tickets-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Created By</th>
                  <th>Assigned To</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(ticket => (
                  <tr key={ticket.id}>
                    <td>{ticket.id.slice(0, 8)}</td>
                    <td className="ticket-title">{ticket.title}</td>
                    <td>
                      <span className="category-badge">{ticket.category}</span>
                    </td>
                    <td>
                      <span 
                        className="priority-badge"
                        style={{ backgroundColor: getPriorityColor(ticket.priority) }}
                      >
                        {ticket.priority}
                      </span>
                    </td>
                    <td>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(ticket.status) }}
                      >
                        {ticket.status}
                      </span>
                    </td>
                    <td>
                      {ticket.creator ? 
                        `${ticket.creator.first_name} ${ticket.creator.last_name}` : 
                        'Unknown'
                      }
                    </td>
                    <td>
                      {ticket.assignee ? 
                        `${ticket.assignee.first_name} ${ticket.assignee.last_name}` : 
                        <button 
                          className="assign-btn-small"
                          onClick={() => openAssignModal(ticket.id)}
                        >
                          Assign
                        </button>
                      }
                    </td>
                    <td>{new Date(ticket.created_at).toLocaleDateString()}</td>
                    <td className="actions-cell">
                      <button 
                        className="action-btn view-btn"
                        onClick={() => viewTicketDetails(ticket.id)}
                        title="View"
                      >
                        
                      </button>
                      <button 
                        className="action-btn assign-btn"
                        onClick={() => openAssignModal(ticket.id)}
                        title="Assign"
                      >
                        
                      </button>
                      <button 
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteTicket(ticket.id)}
                        title="Delete"
                      >
                        
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {tickets.length === 0 && (
              <div className="empty-state">
                <p> No tickets found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="users-section">
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.id.slice(0, 8)}</td>
                    <td>{u.first_name} {u.last_name}</td>
                    <td>{u.email}</td>
                    <td>{u.phone_number || 'N/A'}</td>
                    <td>
                      <span className={`role-badge role-${u.role}`}>
                        {u.role === 'admin' && ''}
                        {u.role === 'employee' && ''}
                        {u.role === 'visitor' && ''}
                        {' '}{u.role}
                      </span>
                    </td>
                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td>
                      <button 
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteUser(u.id)}
                        disabled={u.id === user.id}
                      >
                        
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ticket Details Modal */}
      {showTicketModal && selectedTicket && (
        <div className="modal-overlay" onClick={() => setShowTicketModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2> Ticket Details</h2>
              <button className="close-btn" onClick={() => setShowTicketModal(false)}></button>
            </div>
            <div className="modal-body">
              <div className="ticket-detail-row">
                <strong>Title:</strong>
                <span>{selectedTicket.title}</span>
              </div>
              <div className="ticket-detail-row">
                <strong>Description:</strong>
                <p>{selectedTicket.description}</p>
              </div>
              <div className="ticket-detail-row">
                <strong>Status:</strong>
                <select 
                  value={selectedTicket.status}
                  onChange={(e) => handleUpdateTicketStatus(selectedTicket.id, e.target.value)}
                  className="status-select"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2> Assign Ticket</h2>
              <button className="close-btn" onClick={() => setShowAssignModal(false)}></button>
            </div>
            <div className="modal-body">
              <p>Select employee:</p>
              <div className="employees-list">
                {users.filter(u => u.role === 'employee' || u.role === 'admin').map(emp => (
                  <button
                    key={emp.id}
                    className="employee-item"
                    onClick={() => handleAssignTicket(emp.id)}
                  >
                    <span>{emp.first_name} {emp.last_name}</span>
                    <span>{emp.role}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
