import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, Trophy, FolderGit2, Activity, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { adminService } from '../../services/adminService';

const COLORS = ['#B6FF00', '#475569', '#64748b', '#334155'];

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [logsError, setLogsError] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAnalytics();
      if (res.success && res.data) {
        setData(res.data);
        setError(false);
      } else {
        setError(true);
      }
    } catch {
      setData(null);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await adminService.getActivityLogs({ limit: 5 });
      if (res.success && res.data) {
        setRecentLogs(res.data.slice(0, 6)); // Ensure we only show top few
        setLogsError(false);
      } else {
        setLogsError(true);
      }
    } catch {
      setRecentLogs([]);
      setLogsError(true);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    fetchLogs();
  }, []);

  const handleRefresh = () => {
    fetchAnalytics();
    fetchLogs();
  };

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto space-y-6">
        <div className="h-28 rounded-[var(--radius-md)] bg-surface-elevated border border-border animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 rounded-[var(--radius-md)] bg-surface-elevated border border-border animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const roleDistribution = [
    { name: 'Participants', value: data?.totalParticipants || 0 },
    { name: 'Organizers', value: data?.totalOrganizers || 0 },
    { name: 'Judges', value: data?.totalJudges || 0 },
    { name: 'Admins', value: data?.roleDistribution?.find(r => r._id === 'admin')?.count || 0 },
  ];

  const hasRoleData = roleDistribution.some(r => r.value > 0);

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-surface border border-border rounded-[var(--radius-md)] p-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase font-bold text-primary px-2 py-0.5 rounded-[var(--radius-sm)] bg-primary/10 border border-primary/20 mb-2 inline-block">
            Super Admin Portal
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight">System Overview</h1>
          <p className="text-muted-foreground text-xs mt-1">Monitor platform activity, users, hackathons and system health.</p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading || logsLoading}
          className="px-4 py-2 rounded-[var(--radius-md)] bg-background border border-border hover:bg-surface-hover text-xs font-semibold text-foreground flex items-center gap-2 transition-all disabled:opacity-50 active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${(loading || logsLoading) ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Global Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link to="/admin/users" className="group bg-surface border border-border rounded-[var(--radius-md)] p-5 hover:border-primary/40 hover:-translate-y-0.5 transition-all shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Total Users</p>
            <Users className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <h3 className="text-2xl font-extrabold text-foreground">
            {error ? <span className="text-sm font-normal text-error">Unable to load</span> : (data?.totalUsers || 0)}
          </h3>
        </Link>

        <div className="bg-surface border border-border rounded-[var(--radius-md)] p-5 hover:border-primary/40 transition-all shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Total Hackathons</p>
            <FolderGit2 className="w-4 h-4 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-extrabold text-foreground">
            {error ? <span className="text-sm font-normal text-error">Unable to load</span> : (data?.totalHackathons || 0)}
          </h3>
        </div>

        <div className="bg-surface border border-border rounded-[var(--radius-md)] p-5 hover:border-primary/40 transition-all shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Total Teams</p>
            <Users className="w-4 h-4 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-extrabold text-foreground">
            {error ? <span className="text-sm font-normal text-error">Unable to load</span> : (data?.totalTeams || 0)}
          </h3>
        </div>

        <div className="bg-surface border border-border rounded-[var(--radius-md)] p-5 hover:border-primary/40 transition-all shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Total Submissions</p>
            <Trophy className="w-4 h-4 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-extrabold text-foreground">
            {error ? <span className="text-sm font-normal text-error">Unable to load</span> : (data?.totalSubmissions || 0)}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* User Role Distribution Chart */}
        <div className="bg-surface border border-border rounded-[var(--radius-md)] p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-sm text-foreground">Role Distribution</h3>
            {hasRoleData && (
              <Link to="/admin/users" className="text-[10px] text-muted-foreground hover:text-primary uppercase font-bold tracking-wider">View Users →</Link>
            )}
          </div>
          
          <div className="flex-1 min-h-[220px] flex items-center justify-center">
            {hasRoleData ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={roleDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {roleDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--surface-elevated)', 
                      borderColor: 'var(--border)', 
                      borderRadius: '8px', 
                      fontSize: '11px',
                      color: 'var(--foreground)'
                    }} 
                    itemStyle={{ color: 'var(--foreground)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center">
                <Shield className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm font-semibold text-foreground">No distribution data</p>
                <p className="text-[11px] text-muted-foreground mt-1">Role analytics will appear as users join.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent System Activity */}
        <div className="bg-surface border border-border rounded-[var(--radius-md)] p-0 flex flex-col overflow-hidden">
          <div className="p-5 flex justify-between items-center border-b border-border">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Recent Activity
            </h3>
            <Link to="/admin/activity" className="text-[10px] text-muted-foreground hover:text-primary uppercase font-bold tracking-wider">View Audit Logs →</Link>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {logsLoading ? (
              <div className="p-5 space-y-3">
                {[1,2,3,4].map(i => <div key={i} className="h-10 bg-surface-elevated animate-pulse rounded-md" />)}
              </div>
            ) : logsError ? (
              <div className="p-10 text-center flex flex-col items-center justify-center">
                <p className="text-sm font-semibold text-error mb-3">Unable to load recent activity.</p>
                <button
                  onClick={fetchLogs}
                  className="px-4 py-1.5 rounded-[var(--radius-sm)] bg-surface-elevated border border-border hover:bg-surface-hover text-xs font-semibold text-foreground transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : recentLogs.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-sm font-semibold text-foreground">No system activity yet.</p>
                <p className="text-[11px] text-muted-foreground mt-1">Recent administrative and platform events will appear here.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recentLogs.map((log) => (
                  <div key={log._id} className="p-4 hover:bg-surface-hover transition-colors flex gap-3 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">
                        {log.user?.name || 'System'} <span className="text-muted-foreground font-normal">performed</span> <span className="font-mono text-primary uppercase font-bold">{log.action}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-muted-foreground">{log.entityType} ({log.entityId})</span>
                        <span className="text-[10px] text-muted-foreground/50">•</span>
                        <span className="text-[10px] text-muted-foreground">{new Date(log.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
