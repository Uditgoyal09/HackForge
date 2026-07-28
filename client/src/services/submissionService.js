import api from './api';

export const submissionService = {
  async createSubmission(hackathonId, data) {
    const res = await api.post(`/hackathons/${hackathonId}/submissions`, data);
    return res.data;
  },

  async getSubmissionDetails(id) {
    const res = await api.get(`/submissions/${id}`);
    return res.data;
  },

  async updateSubmission(id, data) {
    const res = await api.put(`/submissions/${id}`, data);
    return res.data;
  },

  async getHackathonSubmissions(hackathonId) {
    const res = await api.get(`/hackathons/${hackathonId}/submissions`);
    return res.data;
  },
};
