import axios from 'axios';

// Create an axios instance for your backend
const API = axios.create({
  baseURL: 'http://localhost:5000/api', // backend URL
  withCredentials: true, // optional: if using cookies
});

// Automatically attach JWT token from localStorage
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
