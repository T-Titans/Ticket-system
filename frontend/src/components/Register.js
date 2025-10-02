import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    console.log('🔴 REGISTER FORM SUBMITTED');
    
    try {
      console.log('🟡 Sending registration request to:', `${API_URL}/api/auth/register`);
      
      // ✅ Remove timeout and simplify the request
      const res = await axios.post(`${API_URL}/api/auth/register`, {
        name,
        email,
        password
      });
      
      console.log('🟢 Registration successful:', res.data);
      
      const token = res.data.token;
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('role', res.data.user?.role || 'user');
        navigate('/dashboard');
      } else {
        setError('Registration failed: no token returned');
      }
    } catch (err) {
      console.error('🔴 FULL Registration error:', err);
      console.error('🔴 Error code:', err.code);
      console.error('🔴 Error message:', err.message);
      
      if (err.code === 'ECONNREFUSED') {
        setError('Cannot connect to server. Backend is not running on port 5000.');
      } else if (err.message.includes('timeout')) {
        setError('Server timeout. Backend might be frozen or not responding.');
      } else if (err.response) {
        setError(`Server error: ${err.response.data.message || err.response.status}`);
      } else {
        setError('Network error. Check if backend is running.');
      }
    }
  };

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h2>Register</h2>
        
        {error && (
          <div style={{ color: 'red', backgroundColor: '#ffe6e6', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>
            Error: {error}
          </div>
        )}
        
        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required type="email" />
        <input placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} type="password" required />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;