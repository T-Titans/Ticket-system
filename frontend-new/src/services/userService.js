import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const userService = {
  // Get all users
  getAllUsers: async (role = null) => {
    try {
      const params = role ? { role } : {};
      const response = await axios.get(`${API_URL}/users`, {
        params,
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get user by ID
  getUserById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/users/${id}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update user
  updateUser: async (id, updates) => {
    try {
      const response = await axios.put(`${API_URL}/users/${id}`, updates, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete user
  deleteUser: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/users/${id}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get user stats
  getUserStats: async () => {
    try {
      const response = await axios.get(`${API_URL}/users/stats`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};
