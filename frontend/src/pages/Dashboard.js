import React, { useState } from 'react';
import TicketForm from '../components/TicketForm';
import TicketList from '../components/TicketList';

const Dashboard = () => {
  const [refreshTickets, setRefreshTickets] = useState(0);
  const [activeTab, setActiveTab] = useState('create');
  const userRole = localStorage.getItem('role') || 'user';
  const userName = localStorage.getItem('userName') || 'User';

  const handleTicketCreated = () => {
    setRefreshTickets(prev => prev + 1);
    setActiveTab('tickets');
  };

  const getWelcomeMessage = () => {
    switch(userRole) {
      case 'support':
        return '🔧 Support Agent Dashboard';
      case 'admin':
        return '👑 Admin Dashboard';
      default:
        return '🎫 User Dashboard';
    }
  };

  const getDescription = () => {
    switch(userRole) {
      case 'support':
        return 'Manage and resolve all tickets in the system';
      case 'admin':
        return 'Full system access and management';
      default:
        return 'Create and track your support tickets';
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {userName}!</h1>
        <h2>{getWelcomeMessage()}</h2>
        <p>{getDescription()}</p>
      </div>
      
      {/* Tab Navigation - Only show create tab for regular users */}
      <div className="dashboard-tabs">
        {userRole === 'user' && (
          <button 
            className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            🎫 Create Ticket
          </button>
        )}
        <button 
          className={`tab-button ${activeTab === 'tickets' ? 'active' : ''}`}
          onClick={() => setActiveTab('tickets')}
        >
          📋 {userRole === 'user' ? 'My Tickets' : 'All Tickets'}
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="dashboard-content">
        {activeTab === 'create' && userRole === 'user' && (
          <div className="dashboard-section">
            <TicketForm onTicketCreated={handleTicketCreated} />
          </div>
        )}
        
        {activeTab === 'tickets' && (
          <div className="dashboard-section">
            <TicketList refresh={refreshTickets} />
          </div>
        )}
        
        {/* Show message if support/admin tries to create ticket */}
        {activeTab === 'create' && userRole !== 'user' && (
          <div className="dashboard-section">
            <div className="card">
              <h3>Ticket Creation</h3>
              <p>As a {userRole}, you don't create tickets. Use the "{userRole === 'user' ? 'My Tickets' : 'All Tickets'}" tab to manage existing tickets.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;