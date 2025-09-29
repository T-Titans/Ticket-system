import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [activeDropdown, setActiveDropdown] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const mainTabs = [
    { 
      id: 'tickets', 
      label: 'Tickets', 
      icon: '🎫', 
      path: '/tickets',
      subTabs: [
        { label: 'My Tickets', path: '/tickets/my', count: user.myTicketsCount || 5 },
        { label: 'All Tickets', path: '/tickets/all', count: 42 },
        { label: 'New Ticket', path: '/tickets/new' },
        { label: 'Flagged Tickets', path: '/tickets/flagged', count: 2 },
        { label: 'Recent Tickets', path: '/tickets/recent' }
      ]
    },
    { 
      id: 'assets', 
      label: 'Assets', 
      icon: '💻', 
      path: '/assets',
      subTabs: [
        { label: 'Hardware Inventory', path: '/assets/hardware' },
        { label: 'Software Licenses', path: '/assets/software' },
        { label: 'Network Equipment', path: '/assets/network' },
        { label: 'Mobile Devices', path: '/assets/mobile' },
        { label: 'Asset Reports', path: '/assets/reports' }
      ]
    },
    { 
      id: 'knowledge', 
      label: 'Knowledge Base', 
      icon: '📚', 
      path: '/knowledge',
      subTabs: [
        { label: 'Tech Solutions', path: '/knowledge/solutions' },
        { label: 'Hardware Guides', path: '/knowledge/hardware' },
        { label: 'Software Tutorials', path: '/knowledge/software' },
        { label: 'Network Issues', path: '/knowledge/network' },
        { label: 'FAQ', path: '/knowledge/faq' }
      ]
    },
    { 
      id: 'reports', 
      label: 'Reports', 
      icon: '📊', 
      path: '/reports',
      subTabs: [
        { label: 'Ticket Analytics', path: '/reports/tickets' },
        { label: 'Performance Metrics', path: '/reports/performance' },
        { label: 'Asset Utilization', path: '/reports/assets' },
        { label: 'SLA Compliance', path: '/reports/sla' },
        { label: 'Custom Reports', path: '/reports/custom' }
      ]
    },
    { 
      id: 'admin', 
      label: 'Administration', 
      icon: '⚙️', 
      path: '/admin',
      subTabs: [
        { label: 'User Management', path: '/admin/users' },
        { label: 'Department Setup', path: '/admin/departments' },
        { label: 'System Settings', path: '/admin/settings' },
        { label: 'Security Policies', path: '/admin/security' },
        { label: 'Backup & Recovery', path: '/admin/backup' }
      ],
      adminOnly: true
    }
  ];

  if (!token) return null;

  return (
    <nav className="tech-navbar">
      <div className="navbar-brand">
        <div className="brand-logo">
          <span className="logo-icon">🔧</span>
          <span className="brand-text">TechDesk Pro</span>
        </div>
        <div className="company-info">
          <span className="company-name">IT Support Portal</span>
        </div>
      </div>

      <div className="navbar-tabs">
        {mainTabs.map(tab => {
          if (tab.adminOnly && user.userType !== 'it_specialist') return null;
          
          return (
            <div 
              key={tab.id} 
              className={`nav-tab ${activeDropdown === tab.id ? 'active' : ''}`}
              onMouseEnter={() => setActiveDropdown(tab.id)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link to={tab.path} className="tab-link">
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
                <span className="dropdown-arrow">▼</span>
              </Link>
              
              {activeDropdown === tab.id && (
                <div className="dropdown-menu">
                  {tab.subTabs.map(subTab => (
                    <Link 
                      key={subTab.path} 
                      to={subTab.path} 
                      className="dropdown-item"
                      onClick={() => setActiveDropdown(null)}
                    >
                      <span className="item-label">{subTab.label}</span>
                      {subTab.count && (
                        <span className="item-count">{subTab.count}</span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="navbar-user">
        <div className="user-info">
          <div className="user-avatar">
            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
          </div>
          <div className="user-details">
            <span className="user-name">{user.firstName} {user.lastName}</span>
            <span className="user-role">{user.department}</span>
            <span className="user-id">ID: {user.employeeId}</span>
          </div>
        </div>
        
        <div className="user-actions">
          <button className="notification-btn">
            🔔
            <span className="notification-badge">3</span>
          </button>
          <button className="settings-btn">⚙️</button>
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;