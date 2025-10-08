import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const TicketList = ({ refresh }) => {
  const [tickets, setTickets] = useState([]);
  const [supportAgents, setSupportAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('user');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    fetchTickets();
    const role = localStorage.getItem('role');
    const id = localStorage.getItem('userId');
    if (role) setUserRole(role);
    if (id) setUserId(id);
    
    // If user is support agent, fetch support agents for assignment
    if (role === 'support' || role === 'admin') {
      fetchSupportAgents();
    }
  }, [refresh]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/api/tickets');
      setTickets(res.data.tickets);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchSupportAgents = async () => {
    try {
      const res = await api.get('/api/support-agents');
      setSupportAgents(res.data.supportAgents);
    } catch (err) {
      console.error('Error fetching support agents:', err);
    }
  };

  const updateTicketStatus = async (ticketId, newStatus) => {
    try {
      await api.put(`/api/tickets/${ticketId}`, { status: newStatus });
      fetchTickets();
    } catch (err) {
      console.error('Error updating ticket:', err);
      alert('Error updating ticket');
    }
  };

  const assignTicket = async (ticketId, agentId) => {
    try {
      await api.put(`/api/tickets/${ticketId}`, { assignedTo: agentId });
      fetchTickets();
    } catch (err) {
      console.error('Error assigning ticket:', err);
      alert('Error assigning ticket');
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'open': 'blue',
      'in-progress': 'orange',
      'resolved': 'green',
      'closed': 'gray'
    };
    
    const statusLabels = {
      'open': 'Open',
      'in-progress': 'In Progress',
      'resolved': 'Resolved',
      'closed': 'Closed'
    };
    
    return (
      <span className={`badge badge-${statusColors[status]}`}>
        {statusLabels[status]}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityColors = {
      'low': 'green',
      'medium': 'blue',
      'high': 'orange',
      'critical': 'red'
    };
    
    return (
      <span className={`badge badge-${priorityColors[priority]}`}>
        {priority.toUpperCase()}
      </span>
    );
  };

  if (loading) return <div className="loading">Loading tickets...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="card">
      <div className="ticket-list-header">
        <h3>
          {userRole === 'user' ? 'Your Tickets' : 'All Tickets'} 
          <span className="ticket-count">({tickets.length})</span>
        </h3>
        {userRole !== 'user' && (
          <div className="role-badge">
            {userRole === 'support' ? '🔧 Support Agent' : '👑 Admin'}
          </div>
        )}
      </div>
      
      {tickets.length === 0 ? (
        <p className="no-tickets">No tickets found.</p>
      ) : (
        <div className="tickets-list">
          {tickets.map(ticket => (
            <div key={ticket._id} className="ticket-item">
              <div className="ticket-header">
                <div className="ticket-title-section">
                  <h4>{ticket.title}</h4>
                  <span className="ticket-category">#{ticket.category}</span>
                </div>
                <div className="ticket-meta">
                  {getPriorityBadge(ticket.priority)}
                  {getStatusBadge(ticket.status)}
                </div>
              </div>
              
              <p className="ticket-description">{ticket.description}</p>
              
              <div className="ticket-info">
                <div className="ticket-creator">
                  <strong>Created by:</strong> {ticket.createdBy?.name}
                </div>
                <div className="ticket-dates">
                  <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                  {ticket.updatedAt !== ticket.createdAt && (
                    <span>Updated: {new Date(ticket.updatedAt).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
              
              {/* Support Agent Actions */}
              {(userRole === 'support' || userRole === 'admin') && (
                <div className="ticket-actions">
                  <div className="action-group">
                    <label>Update Status:</label>
                    <select 
                      value={ticket.status}
                      onChange={(e) => updateTicketStatus(ticket._id, e.target.value)}
                    >
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                  
                  <div className="action-group">
                    <label>Assign to:</label>
                    <select 
                      value={ticket.assignedTo?._id || ''}
                      onChange={(e) => assignTicket(ticket._id, e.target.value)}
                    >
                      <option value="">Unassigned</option>
                      {supportAgents.map(agent => (
                        <option key={agent._id} value={agent._id}>
                          {agent.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {ticket.assignedTo && (
                    <div className="assigned-agent">
                      <strong>Assigned to:</strong> {ticket.assignedTo.name}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketList;