import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role'); // Now this will be used
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  // Use the role variable to show different navigation based on user role
  const renderRoleSpecificLinks = () => {
    if (!token) return null;

    switch(role) {
      case 'admin':
        return (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/users">User Management</Link>
            <Link to="/reports">Reports</Link>
            <Link to="/all-tickets">All Tickets</Link>
          </>
        );
      case 'agent':
        return (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/assigned-tickets">My Tickets</Link>
            <Link to="/ticket-queue">Ticket Queue</Link>
          </>
        );
      case 'user':
      default:
        return (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/my-tickets">My Tickets</Link>
            <Link to="/submit-ticket">Submit Ticket</Link>
          </>
        );
    }
  };

  return (
    <nav className="navbar">
      <div className="brand">Capaciti Ticketing</div>
      <div className="nav-links">
        {token ? (
          <>
            {renderRoleSpecificLinks()}
            {/* Display user role */}
            <span className="user-role">({role})</span>
            <button onClick={logout} className="btn-logout">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;