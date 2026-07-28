import api from './api';

export const invitationService = {
  async sendInvitation(teamId, email) {
    const res = await api.post(`/teams/${teamId}/invitations`, { invitedEmail: email });
    return res.data;
  },

  async getMyInvitations() {
    const res = await api.get('/invitations/me');
    return res.data;
  },

  async acceptInvitation(id) {
    const res = await api.patch(`/invitations/${id}/accept`);
    return res.data;
  },

  async rejectInvitation(id) {
    const res = await api.patch(`/invitations/${id}/reject`);
    return res.data;
  },
};
