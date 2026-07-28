import api from './api';

export const notificationService = {
  async getNotifications() {
    const res = await api.get('/notifications');
    return res.data;
  },

  async getUnreadCount() {
    const res = await api.get('/notifications/unread-count');
    return res.data;
  },

  async markAsRead(id) {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },

  async markAllAsRead() {
    const res = await api.patch('/notifications/read-all');
    return res.data;
  },

  async deleteNotification(id) {
    const res = await api.delete(`/notifications/${id}`);
    return res.data;
  },
};
