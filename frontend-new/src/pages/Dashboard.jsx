import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCapacitiTheme } from '../contexts/CapacitiThemeContext';
import DashboardThemeSelector from '../components/DashboardThemeSelector';
import CapacitiThemeToggle from '../components/CapacitiThemeToggle';
import '../components/DashboardThemes.css';

const Dashboard = () => {
  const { user } = useAuth();
  const { isDarkMode } = useCapacitiTheme();
  const [currentTheme, setCurrentTheme] = useState('leopard-pro');
  const [stats, setStats] = useState({
    totalTickets: 0,
    openTickets: 0,
    resolvedTickets: 0,
    inProgress: 0
  });

  useEffect(() => {
    // Load saved theme
    const savedTheme = localStorage.getItem('dashboard-theme');
    if (savedTheme) {
      setCurrentTheme(savedTheme);
    }

    // Simulate loading stats
    setTimeout(() => {
      setStats({
        totalTickets: 142,
        openTickets: 28,
        resolvedTickets: 98,
        inProgress: 16
      });
    }, 1000);
  }, []);

  const handleThemeChange = (themeId) => {
    setCurrentTheme(themeId);
  };

  const getRoleBasedGreeting = () => {
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
    
    switch (user?.role) {
      case 'it_specialist':
        return `${timeGreeting}, ${user?.firstName}! 🛠️`;
      case 'employee':
        return `${timeGreeting}, ${user?.firstName}! 💼`;
      case 'visitor':
        return `${timeGreeting}, ${user?.firstName}! 👋`;
      default:
        return `${timeGreeting}! 🎉`;
    }
  };

  const getRecentActivities = () => [
    { id: 1, action: 'New ticket created', time: '2 minutes ago', type: 'ticket', icon: '🎫' },
    { id: 2, action: 'Password reset completed', time: '15 minutes ago', type: 'security', icon: '🔐' },
    { id: 3, action: 'System backup completed', time: '1 hour ago', type: 'system', icon: '💾' },
    { id: 4, action: 'User account verified', time: '2 hours ago', type: 'user', icon: '✅' },
    { id: 5, action: 'Network maintenance scheduled', time: '3 hours ago', type: 'maintenance', icon: '🔧' }
  ];

  const getQuickActions = () => {
    const actions = [
      { title: 'Create Ticket', icon: '➕', color: 'var(--dashboard-primary)', action: () => console.log('Create ticket') },
      { title: 'View Reports', icon: '📊', color: '#3498db', action: () => console.log('View reports') },
      { title: 'User Management', icon: '👥', color: '#27ae60', action: () => console.log('User management') },
      { title: 'System Settings', icon: '⚙️', color: '#8e44ad', action: () => console.log('Settings') }
    ];

    if (user?.role === 'visitor') {
      return actions.slice(0, 2);
    }
    if (user?.role === 'employee') {
      return actions.slice(0, 3);
    }
    return actions;
  };

  return (
    <div className={`modern-dashboard theme-transition ${isDarkMode ? 'dark' : 'light'}`}>
      {/* Dashboard Header */}
      <header className="dashboard-header">
        <div className="dashboard-title">
          <div className="dashboard-logo">C</div>
          <div>
            <h1>Capaciti Dashboard</h1>
            <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.7 }}>
              Enterprise IT Management System
            </p>
          </div>
        </div>
        
        <div className="dashboard-controls">
          <DashboardThemeSelector 
            currentTheme={currentTheme}
            onThemeChange={handleThemeChange}
          />
          <CapacitiThemeToggle />
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="dashboard-content">
        {/* Welcome Section */}
        <div className="dashboard-card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '700' }}>
                {getRoleBasedGreeting()}
              </h2>
              <p style={{ margin: '0.5rem 0 0 0', opacity: 0.7 }}>
                Welcome back to your {user?.role?.replace('_', ' ')} dashboard
              </p>
            </div>
            <div style={{ 
              padding: '1rem', 
              background: 'var(--dashboard-gradient)', 
              borderRadius: '16px',
              color: 'white',
              fontSize: '2rem'
            }}>
              {user?.role === 'it_specialist' ? '🛠️' : user?.role === 'employee' ? '💼' : '👤'}
            </div>
          </div>
          
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(var(--dashboard-primary), 0.1), rgba(var(--dashboard-secondary), 0.05))',
            padding: '1rem',
            borderRadius: '12px',
            border: '1px solid rgba(var(--dashboard-primary), 0.2)'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--dashboard-primary)' }}>
              ✅ System Status: All Systems Operational
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <span style={{ fontWeight: '600' }}>Frontend:</span>
                <span style={{ color: '#27ae60', marginLeft: '0.5rem' }}>🟢 Online</span>
              </div>
              <div>
                <span style={{ fontWeight: '600' }}>Backend:</span>
                <span style={{ color: '#27ae60', marginLeft: '0.5rem' }}>🟢 Connected</span>
              </div>
              <div>
                <span style={{ fontWeight: '600' }}>Database:</span>
                <span style={{ color: '#27ae60', marginLeft: '0.5rem' }}>🟢 Supabase Active</span>
              </div>
              <div>
                <span style={{ fontWeight: '600' }}>Auth:</span>
                <span style={{ color: '#27ae60', marginLeft: '0.5rem' }}>🟢 Universal Login</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="dashboard-stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <h3 className="stat-title">Total Tickets</h3>
              <div className="stat-icon">🎫</div>
            </div>
            <p className="stat-value">{stats.totalTickets}</p>
            <p className="stat-change positive">+12% this month</p>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <h3 className="stat-title">Open Tickets</h3>
              <div className="stat-icon">📋</div>
            </div>
            <p className="stat-value">{stats.openTickets}</p>
            <p className="stat-change negative">-5% from last week</p>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <h3 className="stat-title">Resolved Tickets</h3>
              <div className="stat-icon">✅</div>
            </div>
            <p className="stat-value">{stats.resolvedTickets}</p>
            <p className="stat-change positive">+18% this month</p>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <h3 className="stat-title">In Progress</h3>
              <div className="stat-icon">⚡</div>
            </div>
            <p className="stat-value">{stats.inProgress}</p>
            <p className="stat-change positive">+3% from yesterday</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
          
          {/* Quick Actions */}
          <div className="dashboard-card">
            <h3>Quick Actions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              {getQuickActions().map((action, index) => (
                <button
                  key={index}
                  className="dashboard-action-btn"
                  onClick={action.action}
                  style={{ background: `linear-gradient(135deg, ${action.color}, ${action.color}dd)` }}
                >
                  <span style={{ fontSize: '1.25rem' }}>{action.icon}</span>
                  {action.title}
                </button>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="dashboard-card">
            <h3>Recent Activity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {getRecentActivities().map((activity) => (
                <div
                  key={activity.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.75rem',
                    background: 'rgba(0, 0, 0, 0.02)',
                    borderRadius: '8px',
                    border: '1px solid rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'var(--dashboard-gradient)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem'
                  }}>
                    {activity.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: '500' }}>{activity.action}</p>
                    <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.7 }}>{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Profile */}
          <div className="dashboard-card">
            <h3>Profile Information</h3>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'var(--dashboard-gradient)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}>
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>
                  {user?.firstName} {user?.lastName}
                </p>
                <p style={{ margin: 0, opacity: 0.7, textTransform: 'capitalize' }}>
                  {user?.role?.replace('_', ' ')}
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '500' }}>Email:</span>
                <span>{user?.email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '500' }}>Department:</span>
                <span>{user?.department || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '500' }}>User Type:</span>
                <span style={{ textTransform: 'capitalize' }}>{user?.userType}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '500' }}>Account Status:</span>
                <span style={{ color: '#27ae60', fontWeight: '500' }}>✅ Active</span>
              </div>
            </div>
          </div>

          {/* System Overview */}
          <div className="dashboard-card">
            <h3>System Overview</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                padding: '1rem',
                background: 'linear-gradient(135deg, rgba(52, 152, 219, 0.1), rgba(52, 152, 219, 0.05))',
                borderRadius: '8px',
                border: '1px solid rgba(52, 152, 219, 0.2)'
              }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#3498db' }}>🌐 Network Status</h4>
                <p style={{ margin: 0, fontSize: '0.875rem' }}>All systems operational</p>
              </div>
              
              <div style={{
                padding: '1rem',
                background: 'linear-gradient(135deg, rgba(46, 204, 113, 0.1), rgba(46, 204, 113, 0.05))',
                borderRadius: '8px',
                border: '1px solid rgba(46, 204, 113, 0.2)'
              }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#27ae60' }}>💾 Database</h4>
                <p style={{ margin: 0, fontSize: '0.875rem' }}>Supabase connected - 99.9% uptime</p>
              </div>
              
              <div style={{
                padding: '1rem',
                background: 'linear-gradient(135deg, rgba(var(--dashboard-primary), 0.1), rgba(var(--dashboard-secondary), 0.05))',
                borderRadius: '8px',
                border: '1px solid rgba(var(--dashboard-primary), 0.2)'
              }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--dashboard-primary)' }}>🔐 Security</h4>
                <p style={{ margin: 0, fontSize: '0.875rem' }}>Universal authentication active</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;