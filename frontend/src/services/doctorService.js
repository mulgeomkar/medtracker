import api from './api';

export const doctorService = {
  // Dashboard
  getDashboardStats: async () => {
    return await api.get('/doctor/dashboard');
  },

  // Patients
  getPatients: async () => {
    return await api.get('/doctor/patients');
  },

  getPatientById: async (id) => {
    return await api.get(`/doctor/patients/${id}`);
  },

  searchPatients: async (query) => {
    return await api.get(`/doctor/patients/search?q=${query}`);
  },

  // Prescriptions
  getPrescriptions: async () => {
    return await api.get('/doctor/prescriptions');
  },

  createPrescription: async (prescriptionData) => {
    return await api.post('/doctor/prescriptions', prescriptionData);
  },

  updatePrescription: async (id, prescriptionData) => {
    return await api.put(`/doctor/prescriptions/${id}`, prescriptionData);
  },

  deletePrescription: async (id) => {
    return await api.delete(`/doctor/prescriptions/${id}`);
  },

  // Analytics
  getPracticeAnalytics: async () => {
    return await api.get('/doctor/analytics');
  },

  // Profile
  getProfile: async () => {
    return await api.get('/doctor/profile');
  },

  updateProfile: async (profileData) => {
    return await api.put('/doctor/profile', profileData);
  },
};
