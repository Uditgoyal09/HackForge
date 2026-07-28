import api from './api';

export const teamService = {
  async createTeam(hackathonId, data) {
    const res = await api.post(`/hackathons/${hackathonId}/teams`, data);
    return res.data;
  },

  async getTeamDetails(id) {
    const res = await api.get(`/teams/${id}`);
    return res.data;
  },

  async updateTeam(id, data) {
    const res = await api.put(`/teams/${id}`, data);
    return res.data;
  },

  async deleteTeam(id) {
    const res = await api.delete(`/teams/${id}`);
    return res.data;
  },

  async leaveTeam(id) {
    const res = await api.post(`/teams/${id}/leave`);
    return res.data;
  },

  async removeMember(id, userId) {
    const res = await api.delete(`/teams/${id}/members/${userId}`);
    return res.data;
  },

  async transferLeadership(id, newLeaderId) {
    const res = await api.patch(`/teams/${id}/transfer-leadership`, { newLeaderId });
    return res.data;
  },
};
