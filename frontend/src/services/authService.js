import api from './api';

export const authService = {
  login: async (email, password) => {
    return await api.post('/auth/login', { email, password });
  },

  googleLogin: async (payload) => {
    const body = typeof payload === 'string'
      ? { credential: payload }
      : (payload || {});
    return await api.post('/auth/google', body);
  },

  signup: async (userData) => {
    return await api.post('/auth/signup', userData);
  },

  logout: async () => {
    return await api.post('/auth/logout');
  },

  updateProfile: async (profileData) => {
    return await api.put('/auth/profile', profileData);
  },

  forgotPassword: async (email) => {
    return await api.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token, newPassword) => {
    return await api.post('/auth/reset-password', { token, newPassword });
  },
};
