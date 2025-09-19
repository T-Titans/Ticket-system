import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api'; // note the import path

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/login', { email, password });
      const token = res.data.token;
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('role', res.data.user?.role || 'user');
        navigate('/dashboard');
      } else {
        alert('Login failed: no token returned');
      }
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert(err.response?.data?.message || 'Login failed. Check credentials.');
    }
  };

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
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
