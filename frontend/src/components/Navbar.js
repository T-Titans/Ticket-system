import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');
  const userName = localStorage.getItem('userName');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">
          <img src="/logo.png" alt="Capaciti Ticketing" className="logo" />
          Capaciti Ticketing
        </Link>
      </div>
      
      <div className="nav-links">
        {token ? (
          <>

            <Link to="/dashboard">Dashboard</Link>
            {userRole === 'admin' && <span className="admin-badge">ADMIN</span>}
            {userRole === 'support' && <span className="support-badge">SUPPORT</span>}
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
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