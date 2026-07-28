import api from './api';

export const authService = {
  async signup(data) {
    const res = await api.post('/auth/signup', data);
    return res.data;
  },

  async login(data) {
    const res = await api.post('/auth/login', data);
    return res.data;
  },

  async logout() {
    const res = await api.post('/auth/logout');
    return res.data;
  },

  async getCurrentUser() {
    const res = await api.get('/auth/me');
    return res.data;
  },

  async changePassword(data) {
    const res = await api.put('/auth/change-password', data);
    return res.data;
  },
};
