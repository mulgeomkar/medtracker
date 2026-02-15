import api from './api';

export const adminService = {
  getDashboardStats: async () => {
    return await api.get('/admin/dashboard');
  },

  getUsers: async (role) => {
    const query = role ? `?role=${encodeURIComponent(role)}` : '';
    return await api.get(`/admin/users${query}`);
  },

  createUser: async (payload) => {
    return await api.post('/admin/users', payload);
  },

  updateUser: async (id, payload) => {
    return await api.put(`/admin/users/${id}`, payload);
  },

  deleteUser: async (id) => {
    return await api.delete(`/admin/users/${id}`);
  },

  getPrescriptions: async () => {
    return await api.get('/admin/prescriptions');
  },

  createPrescription: async (payload) => {
    return await api.post('/admin/prescriptions', payload);
  },

  updatePrescription: async (id, payload) => {
    return await api.put(`/admin/prescriptions/${id}`, payload);
  },

  deletePrescription: async (id) => {
    return await api.delete(`/admin/prescriptions/${id}`);
  },

  getReminders: async () => {
    return await api.get('/admin/reminders');
  },

  createReminder: async (payload) => {
    return await api.post('/admin/reminders', payload);
  },

  updateReminder: async (id, payload) => {
    return await api.put(`/admin/reminders/${id}`, payload);
  },

  deleteReminder: async (id) => {
    return await api.delete(`/admin/reminders/${id}`);
  },

  getInventory: async () => {
    return await api.get('/admin/inventory');
  },

  createInventoryItem: async (payload) => {
    return await api.post('/admin/inventory', payload);
  },

  updateInventoryItem: async (id, payload) => {
    return await api.put(`/admin/inventory/${id}`, payload);
  },

  deleteInventoryItem: async (id) => {
    return await api.delete(`/admin/inventory/${id}`);
  },

  getRefillRequests: async () => {
    return await api.get('/admin/refill-requests');
  },

  createRefillRequest: async (payload) => {
    return await api.post('/admin/refill-requests', payload);
  },

  updateRefillRequest: async (id, payload) => {
    return await api.put(`/admin/refill-requests/${id}`, payload);
  },

  deleteRefillRequest: async (id) => {
    return await api.delete(`/admin/refill-requests/${id}`);
  },

  getDoseLogs: async () => {
    return await api.get('/admin/dose-logs');
  },

  createDoseLog: async (payload) => {
    return await api.post('/admin/dose-logs', payload);
  },

  updateDoseLog: async (id, payload) => {
    return await api.put(`/admin/dose-logs/${id}`, payload);
  },

  deleteDoseLog: async (id) => {
    return await api.delete(`/admin/dose-logs/${id}`);
  },

  getNotifications: async () => {
    return await api.get('/admin/notifications');
  },

  createNotification: async (payload) => {
    return await api.post('/admin/notifications', payload);
  },

  updateNotification: async (id, payload) => {
    return await api.put(`/admin/notifications/${id}`, payload);
  },

  deleteNotification: async (id) => {
    return await api.delete(`/admin/notifications/${id}`);
  },

  getProfile: async () => {
    return await api.get('/admin/profile');
  },

  updateProfile: async (payload) => {
    return await api.put('/admin/profile', payload);
  },
};
