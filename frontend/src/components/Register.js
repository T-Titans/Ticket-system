import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    console.log('🔴 REGISTER FORM SUBMITTED');
    
    try {
      const res = await api.post('/api/auth/register', {
        name,
        email,
        password,
        role
      });
      
      console.log('🟢 Registration successful:', res.data);
      
      const token = res.data.token;
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('role', res.data.user.role);
        localStorage.setItem('userId', res.data.user.id);
        localStorage.setItem('userName', res.data.user.name); // Store user name
        navigate('/dashboard');
      } else {
        setError('Registration failed: no token returned');
      }
    } catch (err) {
      console.error('🔴 FULL Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h2>Register</h2>
        
        {error && (
          <div className="error-message">Error: {error}</div>
        )}
        
        <div className="form-group">
          <label>Full Name *</label>
          <input 
            placeholder="Enter your full name" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            required 
          />
        </div>
        
        <div className="form-group">
          <label>Email *</label>
          <input 
            placeholder="Enter your email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            type="email" 
          />
        </div>
        
        <div className="form-group">
          <label>Password *</label>
          <input 
            placeholder="Create a password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            type="password" 
            required 
          />
          <small style={{color: '#666', fontSize: '12px'}}>
            Password must be at least 6 characters long
          </small>
        </div>
        
        <div className="form-group">
          <label>Account Type</label>
          <select value={role} onChange={e => setRole(e.target.value)}>
            <option value="user">User (Create & View Tickets)</option>
            <option value="support">Support Agent (Manage Tickets)</option>
          </select>
          <small style={{color: '#666', fontSize: '12px'}}>
            Choose "Support Agent" if you'll be resolving tickets
          </small>
        </div>
        
        <button type="submit">Create Account</button>
        
        <div style={{textAlign: 'center', marginTop: '20px', color: '#666'}}>
          Already have an account? <a href="/login" style={{color: '#667eea'}}>Login here</a>
        </div>
      </form>
    </div>
  );
};

export default Register;