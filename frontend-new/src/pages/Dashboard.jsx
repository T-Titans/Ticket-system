import React, { useState, useEffect } from 'react';

function Dashboard() {
  const [tickets, setTickets] = useState([]);
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    // Mock tech-specific data
    const mockTickets = [
      {
        id: 'TK-001',
        title: 'Windows 11 BSOD Error',
        description: 'Computer crashes with blue screen - Driver Power State Failure',
        category: 'Hardware',
        subcategory: 'Desktop Computer',
        status: 'Open',
        priority: 'High',
        assignedTo: 'John Smith',
        requester: 'Sarah Johnson',
        department: 'Finance',
        deskNumber: 'F-205',
        dateCreated: '2025-09-28',
        lastUpdate: '2025-09-28 10:30',
        tags: ['BSOD', 'Windows 11', 'Driver Issue'],
        assetTag: 'DT-F205-001'
      },
      {
        id: 'TK-002',
        title: 'WiFi Connection Dropping',
        description: 'Laptop constantly disconnects from corporate WiFi network',
        category: 'Network',
        subcategory: 'Wireless Connectivity',
        status: 'In Progress',
        priority: 'Medium',
        assignedTo: 'Mike Wilson',
        requester: 'David Brown',
        department: 'Marketing',
        deskNumber: 'M-101',
        dateCreated: '2025-09-27',
        lastUpdate: '2025-09-28 09:15',
        tags: ['WiFi', 'Network', 'Laptop'],
        assetTag: 'LT-M101-003'
      },
      {
        id: 'TK-003',
        title: 'Adobe Creative Suite License Expired',
        description: 'Need license renewal for Photoshop and Illustrator',
        category: 'Software',
        subcategory: 'License Management',
        status: 'Pending Approval',
        priority: 'Medium',
        assignedTo: 'Lisa Chen',
        requester: 'Tom Anderson',
        department: 'Design',
        deskNumber: 'D-301',
        dateCreated: '2025-09-26',
        lastUpdate: '2025-09-27 16:45',
        tags: ['Adobe', 'License', 'Software'],
        assetTag: 'SW-ADOBE-001'
      },
      {
        id: 'TK-004',
        title: 'Printer Not Responding',
        description: 'HP LaserJet printer showing offline status, cannot print documents',
        category: 'Hardware',
        subcategory: 'Printer',
        status: 'Resolved',
        priority: 'Low',
        assignedTo: 'Alex Rodriguez',
        requester: 'Emma Davis',
        department: 'HR',
        deskNumber: 'HR-105',
        dateCreated: '2025-09-25',
        lastUpdate: '2025-09-26 14:20',
        tags: ['Printer', 'HP', 'Network Printer'],
        assetTag: 'PR-HR105-001'
      }
    ];

    const mockAssets = [
      { type: 'Desktops', count: 125, status: 'Active' },
      { type: 'Laptops', count: 89, status: 'Active' },
      { type: 'Printers', count: 45, status: 'Mixed' },
      { type: 'Servers', count: 12, status: 'Critical' },
      { type: 'Network Equipment', count: 67, status: 'Active' },
      { type: 'Mobile Devices', count: 156, status: 'Active' }
    ];

    setTimeout(() => {
      setTickets(mockTickets);
      setAssets(mockAssets);
      setIsLoading(false);
    }, 1000);
  }, []);

  const stats = {
    totalTickets: tickets.length,
    openTickets: tickets.filter(t => t.status === 'Open').length,
    inProgressTickets: tickets.filter(t => t.status === 'In Progress').length,
    resolvedTickets: tickets.filter(t => t.status === 'Resolved').length,
    highPriorityTickets: tickets.filter(t => t.priority === 'High').length,
    averageResolutionTime: '4.2 hours',
    slaCompliance: '94.5%'
  };

  if (isLoading) {
    return (
      <div className="tech-loading">
        <div className="loading-spinner"></div>
        <h2>Loading TechDesk Dashboard...</h2>
        <p>Initializing your IT support environment</p>
      </div>
    );
  }

  return (
    <div className="tech-dashboard">
      <div className="dashboard-header">
        <div className="header-info">
          <h1>Welcome back, {user.firstName}! 👋</h1>
          <div className="user-badge-container">
            <span className="user-type-badge">{user.userType}</span>
            <span className="department-badge">{user.department}</span>
            <span className="location-badge">Desk: {user.deskNumber}</span>
          </div>
        </div>
        
        <div className="quick-actions">
          <button className="quick-action-btn primary">
            ➕ New Ticket
          </button>
          <button className="quick-action-btn secondary">
            📊 View Reports
          </button>
          <button className="quick-action-btn secondary">
            💻 Check Assets
          </button>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeView === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveView('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab-btn ${activeView === 'tickets' ? 'active' : ''}`}
          onClick={() => setActiveView('tickets')}
        >
          🎫 My Tickets ({tickets.length})
        </button>
        <button 
          className={`tab-btn ${activeView === 'assets' ? 'active' : ''}`}
          onClick={() => setActiveView('assets')}
        >
          💻 Assets
        </button>
        <button 
          className={`tab-btn ${activeView === 'knowledge' ? 'active' : ''}`}
          onClick={() => setActiveView('knowledge')}
        >
          📚 Knowledge Base
        </button>
      </div>

      <div className="dashboard-content">
        {activeView === 'overview' && (
          <div className="overview-content">
            <div className="stats-grid">
              <div className="stat-card primary">
                <div className="stat-icon">🎫</div>
                <div className="stat-info">
                  <h3>Total Tickets</h3>
                  <span className="stat-number">{stats.totalTickets}</span>
                  <span className="stat-change">+12% this week</span>
                </div>
              </div>
              
              <div className="stat-card warning">
                <div className="stat-icon">🔥</div>
                <div className="stat-info">
                  <h3>High Priority</h3>
                  <span className="stat-number">{stats.highPriorityTickets}</span>
                  <span className="stat-change">Needs attention</span>
                </div>
              </div>
              
              <div className="stat-card success">
                <div className="stat-icon">✅</div>
                <div className="stat-info">
                  <h3>SLA Compliance</h3>
                  <span className="stat-number">{stats.slaCompliance}</span>
                  <span className="stat-change">Above target</span>
                </div>
              </div>
              
              <div className="stat-card info">
                <div className="stat-icon">⏱️</div>
                <div className="stat-info">
                  <h3>Avg Resolution</h3>
                  <span className="stat-number">{stats.averageResolutionTime}</span>
                  <span className="stat-change">-15 min improved</span>
                </div>
              </div>
            </div>

            <div className="recent-activity">
              <h2>🔄 Recent System Activity</h2>
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-icon hardware">🖥️</div>
                  <div className="activity-content">
                    <p><strong>Hardware Alert:</strong> Server CPU usage at 85%</p>
                    <span className="activity-time">5 minutes ago</span>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon software">💿</div>
                  <div className="activity-content">
                    <p><strong>Software Update:</strong> Windows updates deployed to 45 machines</p>
                    <span className="activity-time">15 minutes ago</span>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon network">🌐</div>
                  <div className="activity-content">
                    <p><strong>Network Event:</strong> WiFi access point rebooted successfully</p>
                    <span className="activity-time">1 hour ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'tickets' && (
          <div className="tickets-content">
            <div className="tickets-header">
              <h2>🎫 My Support Tickets</h2>
              <div className="tickets-filters">
                <select className="filter-select">
                  <option>All Categories</option>
                  <option>Hardware</option>
                  <option>Software</option>
                  <option>Network</option>
                  <option>Security</option>
                </select>
                <select className="filter-select">
                  <option>All Priorities</option>
                  <option>Critical</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
            </div>

            <div className="tickets-table">
              <table>
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Assigned To</th>
                    <th>Last Update</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map(ticket => (
                    <tr key={ticket.id}>
                      <td className="ticket-id">{ticket.id}</td>
                      <td className="ticket-title">
                        <strong>{ticket.title}</strong>
                        <div className="ticket-tags">
                          {ticket.tags.map(tag => (
                            <span key={tag} className="tag">{tag}</span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span className={`category-badge ${ticket.category.toLowerCase()}`}>
                          {ticket.category}
                        </span>
                      </td>
                      <td>
                        <span className={`priority-badge ${ticket.priority.toLowerCase()}`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${ticket.status.toLowerCase().replace(' ', '-')}`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td>{ticket.assignedTo}</td>
                      <td>{ticket.lastUpdate}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="action-btn view">👁️</button>
                          <button className="action-btn edit">✏️</button>
                          <button className="action-btn comment">💬</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeView === 'assets' && (
          <div className="assets-content">
            <h2>💻 Asset Management</h2>
            <div className="assets-grid">
              {assets.map((asset, index) => (
                <div key={index} className="asset-card">
                  <div className="asset-header">
                    <h3>{asset.type}</h3>
                    <span className={`asset-status ${asset.status.toLowerCase()}`}>
                      {asset.status}
                    </span>
                  </div>
                  <div className="asset-count">{asset.count}</div>
                  <div className="asset-actions">
                    <button className="asset-btn">View Details</button>
                    <button className="asset-btn">Generate Report</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === 'knowledge' && (
          <div className="knowledge-content">
            <h2>📚 IT Knowledge Base</h2>
            <div className="knowledge-categories">
              <div className="knowledge-card">
                <div className="knowledge-icon">🖥️</div>
                <h3>Hardware Troubleshooting</h3>
                <p>Desktop, laptop, printer, and server issues</p>
                <span className="article-count">45 articles</span>
              </div>
              <div className="knowledge-card">
                <div className="knowledge-icon">💿</div>
                <h3>Software Solutions</h3>
                <p>Application errors, license management, updates</p>
                <span className="article-count">62 articles</span>
              </div>
              <div className="knowledge-card">
                <div className="knowledge-icon">🌐</div>
                <h3>Network & Connectivity</h3>
                <p>WiFi, VPN, firewall, and network configuration</p>
                <span className="article-count">38 articles</span>
              </div>
              <div className="knowledge-card">
                <div className="knowledge-icon">🔒</div>
                <h3>Security & Access</h3>
                <p>Password reset, permissions, security policies</p>
                <span className="article-count">29 articles</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;