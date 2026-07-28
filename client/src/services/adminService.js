import api from './api';

export const adminService = {
  async getAnalytics() {
    const res = await api.get('/admin/analytics');
    return res.data;
  },

  async getUsers(params = {}) {
    const res = await api.get('/admin/users', { params });
    return res.data;
  },

  async getUserDetails(id) {
    const res = await api.get(`/admin/users/${id}`);
    return res.data;
  },

  async blockUser(id) {
    const res = await api.patch(`/admin/users/${id}/block`);
    return res.data;
  },

  async unblockUser(id) {
    const res = await api.patch(`/admin/users/${id}/unblock`);
    return res.data;
  },

  async updateUserRole(id, role) {
    const res = await api.patch(`/admin/users/${id}/role`, { role });
    return res.data;
  },

  async getActivityLogs(params = {}) {
    const res = await api.get('/admin/activity-logs', { params });
    return res.data;
  },

  async createAccessCode(data) {
    const res = await api.post('/admin/access-codes', data);
    return res.data;
  },

  async getAccessCodes() {
    const res = await api.get('/admin/access-codes');
    return res.data;
  },

  async revokeAccessCode(id) {
    const res = await api.patch(`/admin/access-codes/${id}/revoke`);
    return res.data;
  },
};
