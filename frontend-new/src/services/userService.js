import axios from 'axios';
import API_BASE_URL from '../config/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const userService = {
  getAllUsers: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getUserById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/${id}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updateUser: async (id, updates) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/users/${id}`, updates, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  deleteUser: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/users/${id}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getUserStats: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/stats`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};
