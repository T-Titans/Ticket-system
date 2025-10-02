import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    console.log('🔴 LOGIN FORM SUBMITTED');
    
    try {
      console.log('🟡 Sending login request to:', `${API_URL}/api/auth/login`);
      
      // ✅ FIX: Use the API_URL variable here
      const res = await axios.post(`${API_URL}/api/auth/login`, { 
        email, 
        password 
      });
      
      console.log('🟢 Login successful:', res.data);
      
      const token = res.data.token;
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('role', res.data.user?.role || 'user');
        navigate('/dashboard');
      } else {
        setError('Login failed: no token returned');
        console.error('❌ No token in response:', res.data);
      }
    } catch (err) {
      console.error('🔴 FULL Login error:', err);
      console.error('🔴 Error response:', err.response);
      
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMessage);
    }
  };

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h2>Login</h2>
        
        {error && (
          <div style={{ 
            color: 'red', 
            backgroundColor: '#ffe6e6', 
            padding: '10px', 
            borderRadius: '5px',
            marginBottom: '15px',
            border: '1px solid red'
          }}>
            Error: {error}
          </div>
        )}
        
        <input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          type="email"
        />
        <input
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          type="password"
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;