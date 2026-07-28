import api from './api';

export const registrationService = {
  async registerForHackathon(hackathonId) {
    const res = await api.post(`/hackathons/${hackathonId}/register`);
    return res.data;
  },

  async getMyRegistrations() {
    const res = await api.get('/registrations/me');
    return res.data;
  },

  async getHackathonRegistrations(hackathonId, params = {}) {
    const res = await api.get(`/hackathons/${hackathonId}/registrations`, { params });
    return res.data;
  },

  async approveRegistration(id) {
    const res = await api.patch(`/registrations/${id}/approve`);
    return res.data;
  },

  async rejectRegistration(id, data = {}) {
    const res = await api.patch(`/registrations/${id}/reject`, data);
    return res.data;
  },

  async cancelRegistration(hackathonId) {
    const res = await api.delete(`/hackathons/${hackathonId}/register`);
    return res.data;
  },
};
