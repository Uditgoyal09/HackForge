import api from './api';

export const leaderboardService = {
  async getLeaderboard(hackathonId) {
    const res = await api.get(`/hackathons/${hackathonId}/leaderboard`);
    return res.data;
  },

  async publishResults(hackathonId) {
    const res = await api.patch(`/hackathons/${hackathonId}/publish-results`);
    return res.data;
  },
};
