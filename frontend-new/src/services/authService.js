import axios from 'axios';
import API_BASE_URL from '../config/api';

export const authService = {
  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  register: async (userData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};
