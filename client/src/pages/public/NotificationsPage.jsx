import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, Trash2, ExternalLink } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { toast } from 'sonner';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getNotifications();
      if (res.success && res.data) {
        setNotifications(res.data);
      }
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch {
      // Silent
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      toast.success('Notification deleted');
    } catch {
      toast.error('Failed to delete notification');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Notification Centre</h1>
            <p className="text-slate-400 text-sm mt-1">Platform updates, team invitations, and result alerts.</p>
          </div>

          {notifications.length > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-800 flex items-center gap-1.5"
            >
              <CheckCheck className="w-4 h-4 text-indigo-400" /> Mark All Read
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/30 border border-slate-800/50 rounded-3xl p-8">
            <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="font-bold text-lg text-slate-300">No Notifications</h3>
            <p className="text-xs text-slate-500 mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n._id}
                className={`p-5 rounded-3xl border transition-all flex items-start justify-between gap-4 text-xs ${
                  !n.isRead
                    ? 'bg-indigo-950/20 border-indigo-500/40 shadow-lg shadow-indigo-500/5'
                    : 'bg-slate-900/40 border-slate-800/80 opacity-75'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-sm text-white">{n.title}</h4>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    )}
                  </div>
                  <p className="text-slate-300 leading-relaxed mb-2">{n.message}</p>
                  <span className="text-[10px] font-mono text-slate-500">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {n.link && (
                    <Link
                      to={n.link}
                      className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-indigo-400 hover:text-white"
                      title="View Resource"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  )}

                  {!n.isRead && (
                    <button
                      onClick={() => handleMarkRead(n._id)}
                      className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-indigo-400"
                      title="Mark as read"
                    >
                      <CheckCheck className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(n._id)}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-rose-400"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
