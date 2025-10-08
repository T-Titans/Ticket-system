import React, { useState } from 'react';
import api from '../utils/api';

const TicketForm = ({ onTicketCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Software');
  const [priority, setPriority] = useState('Medium');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🎫 Starting ticket creation...');
      console.log('📋 Ticket data:', { title, description, category, priority });
      
      // Check if user is logged in
      const token = localStorage.getItem('token');
      console.log('🔑 Token exists:', !!token);
      
      if (!token) {
        throw new Error('Please login first');
      }

      if (!title) {
        throw new Error('Please select a ticket type');
      }

      const res = await api.post('/api/tickets', {
        title,
        description,
        category,
        priority: priority.toLowerCase()
      });

      console.log('✅ Ticket created successfully:', res.data);
      
      // Reset form
      setTitle('');
      setDescription('');
      setCategory('Software');
      setPriority('Medium');
      
      // Notify parent component
      if (onTicketCreated) {
        onTicketCreated(res.data.ticket);
      }
      
      alert('Ticket created successfully!');
      
    } catch (err) {
      console.error('🔴 FULL Ticket creation error:', err);
      
      let errorMessage = 'Failed to create ticket';
      
      if (err.response) {
        errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
      } else if (err.request) {
        errorMessage = 'Cannot connect to server. Please check if backend is running.';
      } else {
        errorMessage = err.message || 'Failed to create ticket';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3>Create New Ticket</h3>
      
      {error && (
        <div className="error-message">
          <strong>Error creating ticket:</strong> {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Ticket Type *</label>
          <select 
            value={title} 
            onChange={e => setTitle(e.target.value)}
            required
            disabled={loading}
          >
            <option value="">Select your Title...</option>
            <option value="User Issue">User</option>
            <option value="Admin Request">Admin</option>
            <option value="Support Agent Task">Support Agent</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Description *</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            placeholder="Please provide a detailed description of your issue or request..."
            rows="4"
            disabled={loading}
          />
        </div>
        
        <div className="row">
          <div className="form-group">
            <label>Category</label>
            <select 
              value={category} 
              onChange={e => setCategory(e.target.value)}
              disabled={loading}
            >
              <option value="Software">Software</option>
              <option value="Hardware">Hardware</option>
              <option value="Network">Network</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Priority</label>
            <select 
              value={priority} 
              onChange={e => setPriority(e.target.value)}
              disabled={loading}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className="btn-primary"
        >
          {loading ? 'Creating Ticket...' : 'Create Ticket'}
        </button>
      </form>
    </div>
  );
};

export default TicketForm;