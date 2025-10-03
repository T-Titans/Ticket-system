import axios from 'axios';
import API_BASE_URL from '../config/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const ticketService = {
  getAllTickets: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await axios.get(`${API_BASE_URL}/tickets?${params}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getTicketById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tickets/${id}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  createTicket: async (ticketData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/tickets`, ticketData, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updateTicket: async (id, updates) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/tickets/${id}`, updates, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  assignTicket: async (id, assigned_to) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/tickets/${id}/assign`, 
        { assigned_to }, 
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  deleteTicket: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/tickets/${id}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getTicketStats: async (user_id, role) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tickets/stats`, {
        params: { user_id, role },
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  addComment: async (ticketId, user_id, comment) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/tickets/${ticketId}/comments`,
        { user_id, comment },
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getComments: async (ticketId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/tickets/${ticketId}/comments`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};
