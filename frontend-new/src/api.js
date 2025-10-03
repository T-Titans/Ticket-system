import axios from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Create axios instance
const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Token management
const TokenManager = {
  getToken: () => localStorage.getItem('authToken'),
  getRefreshToken: () => localStorage.getItem('refreshToken'),
  setToken: (token) => localStorage.setItem('authToken', token),
  setRefreshToken: (token) => localStorage.setItem('refreshToken', token),
  clearTokens: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
  }
};

// Request interceptor
API.interceptors.request.use(
  (config) => {
    const token = TokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = TokenManager.getRefreshToken();
        if (refreshToken) {
          const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
          TokenManager.setToken(data.token);
          originalRequest.headers.Authorization = `Bearer ${data.token}`;
          return API(originalRequest);
        }
      } catch (refreshError) {
        TokenManager.clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export { API, TokenManager };

export const apiMethods = {
  // Authentication
  auth: {
    login: (credentials) => API.post('/auth/login', credentials),
    register: (userData) => API.post('/auth/register', userData),
    logout: () => API.post('/auth/logout'),
    refreshToken: () => API.post('/auth/refresh', {
      refreshToken: TokenManager.getRefreshToken()
    }),
    resetPassword: (email) => API.post('/auth/reset-password', { email }),
    verifyAccount: (token) => API.post('/auth/verify', { token }),
    changePassword: (data) => API.put('/auth/change-password', data),
  },

  // Tickets
  tickets: {
    create: (ticketData) => API.post('/tickets', ticketData),
    getAll: (params = {}) => API.get('/tickets', { params }),
    getById: (id) => API.get(`/tickets/${id}`),
    update: (id, data) => API.put(`/tickets/${id}`, data),
    updateStatus: (id, status) => API.patch(`/tickets/${id}/status`, { status }),
    bulkUpdate: (ids, data) => API.patch('/tickets/bulk', { ids, data }),
    delete: (id) => API.delete(`/tickets/${id}`),
    addComment: (id, comment) => API.post(`/tickets/${id}/comments`, { comment }),
    uploadAttachment: (id, formData) => API.post(`/tickets/${id}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  },

  // Users
  users: {
    getProfile: () => API.get('/users/profile'),
    updateProfile: (data) => API.put('/users/profile', data),
    getAll: (params = {}) => API.get('/users', { params }),
    updateRole: (id, role) => API.patch(`/users/${id}/role`, { role }),
    getDepartments: () => API.get('/users/departments'),
  },

  // Admin-specific methods
  admin: {
    getUsers: (params = {}) => API.get('/admin/users', { params }),
    createUser: (userData) => API.post('/admin/users', userData),
    updateUser: (id, userData) => API.put(`/admin/users/${id}`, userData),
    deleteUser: (id) => API.delete(`/admin/users/${id}`),
    bulkUpdateUsers: (userIds, updateData) => API.patch('/admin/users/bulk-update', { userIds, updateData }),
    bulkDeleteUsers: (userIds) => API.delete('/admin/users/bulk-delete', { data: { userIds } }),
    exportUsers: (params = {}) => API.get('/admin/users/export', { params, responseType: 'blob' }),
    importUsers: (formData) => API.post('/admin/users/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    getRoles: () => API.get('/admin/roles'),
    createRole: (roleData) => API.post('/admin/roles', roleData),
    updateRole: (id, roleData) => API.put(`/admin/roles/${id}`, roleData),
    deleteRole: (id) => API.delete(`/admin/roles/${id}`),
    getPermissions: () => API.get('/admin/permissions'),
    updateUserPermissions: (userId, permissions) => API.put(`/admin/users/${userId}/permissions`, { permissions }),
    getSecuritySettings: () => API.get('/admin/security/settings'),
    updateSecuritySettings: (settings) => API.put('/admin/security/settings', settings),
    getActiveSessions: () => API.get('/admin/security/sessions'),
    terminateSession: (sessionId) => API.delete(`/admin/security/sessions/${sessionId}`),
    getAuditLogs: (params = {}) => API.get('/admin/audit/logs', { params }),
    getDashboardStats: () => API.get('/admin/dashboard/stats'),
    getUserActivity: (params = {}) => API.get('/admin/users/activity', { params }),
    getSystemHealth: () => API.get('/admin/system/health'),
    getSystemSettings: () => API.get('/admin/system/settings'),
    updateSystemSettings: (settings) => API.put('/admin/system/settings', settings),
  },

  // Analytics
  analytics: {
    getDashboard: () => API.get('/analytics/dashboard'),
    getReports: (params = {}) => API.get('/analytics/reports', { params }),
    exportData: (format, params = {}) => API.get(`/analytics/export/${format}`, { params, responseType: 'blob' }),
  },

  // Chat
  chat: {
    getMessages: (roomId, params = {}) => API.get(`/chat/rooms/${roomId}/messages`, { params }),
    sendMessage: (roomId, message) => API.post(`/chat/rooms/${roomId}/messages`, message),
    getRooms: () => API.get('/chat/rooms'),
    createRoom: (data) => API.post('/chat/rooms', data),
  },

  // Files
  files: {
    upload: (formData, onProgress) => API.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
    }),
    download: (id) => API.get(`/files/${id}/download`, { responseType: 'blob' }),
    delete: (id) => API.delete(`/files/${id}`),
  }
};

export default apiMethods;
