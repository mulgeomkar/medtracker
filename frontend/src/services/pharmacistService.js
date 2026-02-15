import api from './api';

export const pharmacistService = {
  // Dashboard
  getDashboardStats: async () => {
    return await api.get('/pharmacist/dashboard');
  },

  // Inventory
  getInventory: async () => {
    return await api.get('/pharmacist/inventory');
  },

  getInventoryItem: async (id) => {
    return await api.get(`/pharmacist/inventory/${id}`);
  },

  addInventoryItem: async (itemData) => {
    return await api.post('/pharmacist/inventory', itemData);
  },

  updateInventoryItem: async (id, itemData) => {
    return await api.put(`/pharmacist/inventory/${id}`, itemData);
  },

  deleteInventoryItem: async (id) => {
    return await api.delete(`/pharmacist/inventory/${id}`);
  },

  // Prescriptions/Orders
  getPendingOrders: async () => {
    return await api.get('/pharmacist/orders/pending');
  },

  fulfillOrder: async (orderId, payload = {}) => {
    return await api.put(`/pharmacist/orders/${orderId}/fulfill`, payload);
  },

  // Analytics
  getInventoryAnalytics: async () => {
    return await api.get('/pharmacist/analytics');
  },

  // Alerts
  getLowStockAlerts: async () => {
    return await api.get('/pharmacist/alerts/low-stock');
  },

  getExpiringItems: async () => {
    return await api.get('/pharmacist/alerts/expiring');
  },

  // Profile
  getProfile: async () => {
    return await api.get('/pharmacist/profile');
  },

  updateProfile: async (profileData) => {
    return await api.put('/pharmacist/profile', profileData);
  },

  getNotifications: async () => {
    return await api.get('/pharmacist/notifications');
  },

  markNotificationRead: async (id) => {
    return await api.put(`/pharmacist/notifications/${id}/read`);
  },
};
