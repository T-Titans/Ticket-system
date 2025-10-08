import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

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
      const res = await api.post('/api/auth/login', { email, password });
      console.log('🟢 Login successful:', res.data);

      const token = res.data.token;
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('role', res.data.user.role);
        localStorage.setItem('userId', res.data.user.id);
        localStorage.setItem('userName', res.data.user.name); // Store user name
        navigate('/dashboard');
      } else {
        setError('Login failed: no token returned');
        console.error('❌ No token in response:', res.data);
      }
    } catch (err) {
      console.error('🔴 FULL Login error:', err);
      
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

        <div className="form-group">
          <label>Email</label>
          <input
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            type="email"
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            placeholder="Enter your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            type="password"
            required
          />
        </div>

        <button type="submit">Login</button>
        
        <div style={{textAlign: 'center', marginTop: '20px', color: '#666'}}>
          Don't have an account? <a href="/register" style={{color: '#667eea'}}>Register here</a>
        </div>
        
        {/* Demo accounts info */}
        <div style={{marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px', fontSize: '12px', color: '#666'}}>
          <strong>Demo Accounts:</strong><br/>
          User: user@demo.com / password123<br/>
          Support: support@demo.com / password123<br/>
          Admin: admin@demo.com / password123
        </div>
      </form>
    </div>
  );
};

export default Login;