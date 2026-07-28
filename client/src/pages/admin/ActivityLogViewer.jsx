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
    <div className="min-h-screen bg-slate-950 text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight">System Activity Audit Logs</h1>
          <p className="text-slate-400 text-sm mt-1">Real-time audit trail of user actions, registrations, reviews, and result publications.</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-14 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/30 border border-slate-800/50 rounded-3xl p-8">
            <Activity className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="font-bold text-slate-300">No Activity Logs Found</h3>
          </div>
        ) : (
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl overflow-hidden">
            <div className="divide-y divide-slate-800/60">
              {logs.map((log) => (
                <div key={log._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs hover:bg-slate-900/40">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                    <div>
                      <p className="font-semibold text-white">
                        {log.user?.name || 'System User'} <span className="font-mono text-indigo-400 font-bold uppercase">[{log.action}]</span>
                      </p>
                      <p className="text-[11px] text-slate-400">Entity: {log.entityType} ({log.entityId})</p>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-slate-500">
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
