import api from './api';

export const patientService = {
  // Dashboard
  getDashboardStats: async () => {
    return await api.get('/patient/dashboard');
  },

  // Prescriptions
  getPrescriptions: async () => {
    return await api.get('/patient/prescriptions');
  },

  getPrescriptionById: async (id) => {
    return await api.get(`/patient/prescriptions/${id}`);
  },

  createRefillRequest: async (prescriptionId, payload = {}) => {
    return await api.post(`/patient/prescriptions/${prescriptionId}/refill-request`, payload);
  },

  getRefillRequests: async () => {
    return await api.get('/patient/refill-requests');
  },

  // Reminders
  getReminders: async () => {
    return await api.get('/patient/reminders');
  },

  createReminder: async (reminderData) => {
    return await api.post('/patient/reminders', reminderData);
  },

  logDose: async (reminderId, payload = {}) => {
    return await api.post(`/patient/reminders/${reminderId}/log-dose`, payload);
  },

  updateReminder: async (id, reminderData) => {
    return await api.put(`/patient/reminders/${id}`, reminderData);
  },

  deleteReminder: async (id) => {
    return await api.delete(`/patient/reminders/${id}`);
  },

  // Analytics
  getHealthAnalytics: async () => {
    return await api.get('/patient/analytics');
  },

  getNotifications: async () => {
    return await api.get('/patient/notifications');
  },

  markNotificationRead: async (id) => {
    return await api.put(`/patient/notifications/${id}/read`);
  },

  // Profile
  getProfile: async () => {
    return await api.get('/patient/profile');
  },

  updateProfile: async (profileData) => {
    return await api.put('/patient/profile', profileData);
  },

  updateMedicalInfo: async (medicalInfo) => {
    return await api.put('/patient/medical-info', medicalInfo);
  },
};
