import api from './api';
import { mockHackathons, mockProjects } from '../data/mockData';

const VITE_USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== 'false'; // Default to true if undefined for showcase

export const hackathonService = {
  async getHackathons(params = {}) {
    let dbHackathons = [];
    
    // Attempt to fetch from real backend
    try {
      // We fetch a larger limit to ensure we get all for client-side merging
      const res = await api.get('/hackathons', { params: { ...params, limit: 100 } });
      if (res.data?.success && res.data?.data) {
        dbHackathons = res.data.data;
      }
    } catch (err) {
      console.warn("Backend unavailable, falling back to mock data only.");
    }

    // Merge Mock + DB (DB takes priority)
    const combinedMap = new Map();
    
    if (VITE_USE_MOCK_DATA) {
      mockHackathons.forEach(h => combinedMap.set(h._id, h));
    }
    
    // Override with DB data if slug or id matches (we'll just use id for now)
    dbHackathons.forEach(h => {
      // For showcase, we only want to show published or active statuses publicly
      if (['published', 'registration_open', 'ongoing', 'completed'].includes(h.status)) {
        combinedMap.set(h._id, h);
      }
    });

    let merged = Array.from(combinedMap.values());

    // Apply Client-Side Filtering (to mimic backend filter support on the merged dataset)
    if (params.search) {
      const q = params.search.toLowerCase();
      merged = merged.filter(h => h.title.toLowerCase().includes(q) || h.description?.toLowerCase().includes(q));
    }
    if (params.mode) {
      merged = merged.filter(h => h.mode === params.mode);
    }
    if (params.status) {
      merged = merged.filter(h => h.status === params.status);
    }

    // Pagination
    const page = parseInt(params.page || '1', 10);
    const limit = parseInt(params.limit || '6', 10);
    const total = merged.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedData = merged.slice((page - 1) * limit, page * limit);

    return {
      success: true,
      data: paginatedData,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages
      }
    };
  },

  async getHackathonById(id) {
    // First try backend
    try {
      const res = await api.get(`/hackathons/${id}`);
      if (res.data?.success && res.data?.data) {
        return res.data;
      }
    } catch (err) {
      console.warn(`Backend fetch failed for hackathon ${id}, checking mock data.`);
    }

    // Fallback to mock
    if (VITE_USE_MOCK_DATA) {
      const mock = mockHackathons.find(h => h._id === id || h.slug === id);
      if (mock) {
        return { success: true, data: mock };
      }
    }
    
    throw new Error("Hackathon not found");
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
