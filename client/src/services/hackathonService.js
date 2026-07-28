import api from './api';

export const hackathonService = {
  async getHackathons(params = {}) {
    const res = await api.get('/hackathons', { params });
    return res.data;
  },

  async getHackathonById(id) {
    const res = await api.get(`/hackathons/${id}`);
    return res.data;
  },

  async createHackathon(data) {
    const res = await api.post('/hackathons', data);
    return res.data;
  },

  async updateHackathon(id, data) {
    const res = await api.put(`/hackathons/${id}`, data);
    return res.data;
  },

  async deleteHackathon(id) {
    const res = await api.delete(`/hackathons/${id}`);
    return res.data;
  },

  async openRegistration(id) {
    const res = await api.patch(`/hackathons/${id}/registration/open`);
    return res.data;
  },

  async closeRegistration(id) {
    const res = await api.patch(`/hackathons/${id}/registration/close`);
    return res.data;
  },
};
