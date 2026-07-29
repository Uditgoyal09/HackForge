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

  async getPublicProjects(params = {}) {
    let dbProjects = [];
    const VITE_USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== 'false';
    
    // Attempt backend fetch
    try {
      const res = await api.get('/submissions/public', { params: { ...params, limit: 100 } });
      if (res.data?.success && res.data?.data) {
        dbProjects = res.data.data;
      }
    } catch (err) {
      console.warn("Backend unavailable for public projects, using mock data.");
    }

    const combinedMap = new Map();
    
    // Fallback Mock data import dynamically to avoid circular issues, though top level import is fine
    if (VITE_USE_MOCK_DATA) {
      const { mockProjects } = await import('../data/mockData');
      mockProjects.forEach(p => combinedMap.set(p._id, p));
    }
    
    // Database overrides mock
    dbProjects.forEach(p => {
      combinedMap.set(p._id, p);
    });

    let merged = Array.from(combinedMap.values());

    return {
      success: true,
      data: merged,
    };
  },
};
