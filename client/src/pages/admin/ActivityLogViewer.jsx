import React, { useState, useEffect } from 'react';
import { Activity, Search, Shield, ArrowLeft } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { toast } from 'sonner';

const ActivityLogViewer = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await adminService.getActivityLogs();
        if (res.success && res.data) {
          setLogs(res.data);
        }
      } catch {
        toast.error('Failed to load activity logs');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight">System Activity Audit Logs</h1>
          <p className="text-muted-foreground text-sm mt-1">Real-time audit trail of user actions, registrations, reviews, and result publications.</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-14 rounded-[var(--radius-lg)] bg-surface-elevated border border-border animate-pulse" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16 bg-surface border border-border rounded-[var(--radius-lg)] p-8">
            <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-bold text-foreground">No Activity Logs Found</h3>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-[var(--radius-lg)] overflow-hidden">
            <div className="divide-y divide-border">
              {logs.map((log) => (
                <div key={log._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs hover:bg-surface-hover">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">
                        {log.user?.name || 'System User'} <span className="font-mono text-primary font-bold uppercase">[{log.action}]</span>
                      </p>
                      <p className="text-[11px] text-muted-foreground">Entity: {log.entityType} ({log.entityId})</p>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogViewer;
