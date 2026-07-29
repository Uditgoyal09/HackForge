import React, { useState, useEffect } from 'react';
import { Activity, Search, Shield } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
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
    <div className="w-full">
      <div className="w-full">
        <PageHeader 
          showBack 
          title="System Activity Audit Logs" 
          description="Real-time audit trail of user actions, registrations, reviews, and result publications."
        />

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-14 rounded-[var(--radius-md)] bg-surface-elevated border border-border animate-pulse" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16 bg-surface border border-border rounded-[var(--radius-md)] p-8 shadow-sm">
            <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-bold text-foreground">No Activity Logs Found</h3>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-[var(--radius-md)] overflow-hidden shadow-sm">
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
