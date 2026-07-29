import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, Trash2, ExternalLink } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { toast } from 'sonner';

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const initialLoadDone = React.useRef(false);

  const fetchUnreadCount = async () => {
    try {
      const res = await notificationService.getUnreadCount();
      if (res.success) {
        const newCount = res.data.unreadCount || 0;
        setUnreadCount(prev => {
          if (initialLoadDone.current && newCount > prev) {
            toast.info('You have a new notification!', { 
              icon: '🔔',
              duration: 4000
            });
          }
          return newCount;
        });
        initialLoadDone.current = true;
      }
    } catch {
      // Ignore notification fetch errors silently
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getNotifications();
      if (res.success) {
        setNotifications(res.data || []);
      }
    } catch {
      // Silent error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 15000); // Poll every 15s for better responsiveness
    return () => clearInterval(interval);
  }, []);

  const handleToggle = () => {
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen(!isOpen);
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark notifications as read');
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setUnreadCount(prev => Math.max(0, prev - 1));
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch {
      // Silent
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-primary text-primary-foreground font-bold text-[10px] rounded-full flex items-center justify-center border-2 border-background">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface border border-border rounded-2xl shadow-2xl z-50 overflow-hidden text-foreground">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs bg-primary-soft text-foreground font-semibold rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>

              {notifications.length > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-border">
              {loading ? (
                <div className="p-8 text-center text-xs text-muted-foreground">Loading notifications...</div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">No notifications yet.</div>
              ) : (
                notifications.slice(0, 10).map((n) => (
                  <div
                    key={n._id}
                    onClick={() => !n.isRead && handleMarkRead(n._id)}
                    className={`p-3.5 text-left text-xs transition-colors hover:bg-surface-hover cursor-pointer ${
                      !n.isRead ? 'bg-primary-soft border-l-2 border-primary' : 'opacity-75'
                    }`}
                  >
                    <p className="font-semibold text-foreground mb-1">{n.title}</p>
                    <p className="text-muted-foreground mb-2 leading-relaxed">{n.message}</p>

                    <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                      <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                      {n.link && (
                        <Link
                          to={n.link}
                          onClick={() => setIsOpen(false)}
                          className="text-foreground hover:text-primary transition-colors flex items-center gap-1 font-sans font-semibold"
                        >
                          View <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-background border-t border-border text-center">
              <Link
                to="/notifications"
                onClick={() => setIsOpen(false)}
                className="text-xs font-semibold text-foreground hover:text-primary transition-colors"
              >
                View all notifications →
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
