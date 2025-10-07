import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';  // This should use the correct base URL

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
      // Remove '/api' from the URL since your api.js baseURL should include it
      const res = await api.post('/auth/login', { email, password });
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
      
      // Enhanced error handling for network issues
      let errorMessage = 'Login failed';
      if (err.code === 'NETWORK_ERROR' || err.message.includes('Network Error')) {
        errorMessage = 'Cannot connect to server. Please check if backend is running on port 5000.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Server endpoint not found. Check your API URL.';
      } else {
        errorMessage = err.response?.data?.message || err.message || 'Login failed';
      }
      setError(errorMessage);
    }
  };

  // Your layout remains exactly the same ↓
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