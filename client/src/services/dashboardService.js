import api from './api';

export const dashboardService = {
  async getParticipantDashboard() {
    const res = await api.get('/participant/dashboard');
    return res.data;
  },

  async getOrganizerAnalytics() {
    const res = await api.get('/organizer/analytics');
    return res.data;
  },

  async getJudgeDashboard() {
    const res = await api.get('/judge/dashboard');
    return res.data;
  },
};
