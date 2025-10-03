import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const ticketService = {
  // Get all tickets
  getAllTickets: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await axios.get(`${API_URL}/tickets?${params}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get ticket by ID
  getTicketById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/tickets/${id}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create ticket
  createTicket: async (ticketData) => {
    try {
      const response = await axios.post(`${API_URL}/tickets`, ticketData, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update ticket
  updateTicket: async (id, updates) => {
    try {
      const response = await axios.put(`${API_URL}/tickets/${id}`, updates, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Assign ticket
  assignTicket: async (id, assigned_to) => {
    try {
      const response = await axios.patch(`${API_URL}/tickets/${id}/assign`, 
        { assigned_to }, 
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete ticket
  deleteTicket: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/tickets/${id}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get ticket stats
  getTicketStats: async (user_id, role) => {
    try {
      const response = await axios.get(`${API_URL}/tickets/stats`, {
        params: { user_id, role },
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Add comment
  addComment: async (ticketId, user_id, comment) => {
    try {
      const response = await axios.post(
        `${API_URL}/tickets/${ticketId}/comments`,
        { user_id, comment },
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get comments
  getComments: async (ticketId) => {
    try {
      const response = await axios.get(
        `${API_URL}/tickets/${ticketId}/comments`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};
