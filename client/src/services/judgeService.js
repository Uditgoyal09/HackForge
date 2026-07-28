import api from './api';

export const judgeService = {
  async assignJudge(submissionId, judgeId) {
    const res = await api.post(`/submissions/${submissionId}/judges/${judgeId}`);
    return res.data;
  },

  async removeJudgeAssignment(submissionId, judgeId) {
    const res = await api.delete(`/submissions/${submissionId}/judges/${judgeId}`);
    return res.data;
  },

  async getJudgeAssignments() {
    const res = await api.get('/judge/assignments');
    return res.data;
  },

  async submitReview(submissionId, data) {
    const res = await api.post(`/submissions/${submissionId}/reviews`, data);
    return res.data;
  },

  async getSubmissionReviews(submissionId) {
    const res = await api.get(`/submissions/${submissionId}/reviews`);
    return res.data;
  },
};
