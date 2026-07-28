import api from './api';

export const userService = {
  async updateProfile(data) {
    const res = await api.put('/users/me', data);
    return res.data;
  },

  async getPublicProfile(id) {
    const res = await api.get(`/users/${id}/profile`);
    return res.data;
  },
};
