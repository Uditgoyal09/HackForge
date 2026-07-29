import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, Trophy, FolderGit2, Activity, Lock, Unlock, ArrowRight } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { adminService } from '../../services/adminService';

const COLORS = ['#6366f1', '#a855f7', '#06b6d4', '#10b981'];

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await adminService.getAnalytics();
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground pt-24 p-6 max-w-7xl mx-auto space-y-6">
        <div className="h-40 rounded-[var(--radius-lg)] bg-surface-elevated border border-border animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 rounded-[var(--radius-lg)] bg-surface-elevated border border-border animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const roleDistribution = data?.rolesDistribution || [
    { name: 'Participants', value: data?.overview?.totalParticipants || 0 },
    { name: 'Organizers', value: data?.overview?.totalOrganizers || 0 },
    { name: 'Judges', value: data?.overview?.totalJudges || 0 },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="bg-gradient-to-r from-surface via-primary/10 to-surface border border-border rounded-[var(--radius-lg)] p-8 mb-10 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-mono uppercase font-bold text-error px-3 py-1 rounded-[var(--radius-sm)] bg-error/10 border border-error/20 mb-3 inline-block">
              Super Admin Portal
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight">System Control & Analytics</h1>
            <p className="text-muted-foreground text-sm mt-1">Platform-wide statistics, user moderation, role security, and audit logs.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/admin/access-codes"
              className="px-4 py-2.5 rounded-[var(--radius-md)] bg-warning/10 border border-warning/20 hover:bg-warning/20 text-xs font-semibold text-warning shadow-lg shadow-warning/10"
            >
              Role Access Codes
            </Link>
            <Link
              to="/admin/users"
              className="px-4 py-2.5 rounded-[var(--radius-md)] bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-semibold shadow-lg shadow-primary/20"
            >
              User Management
            </Link>
            <Link
              to="/admin/activity"
              className="px-4 py-2.5 rounded-[var(--radius-md)] bg-surface border border-border hover:bg-surface-hover text-xs font-semibold text-foreground"
            >
              Audit Logs
            </Link>
          </div>
        </div>

        {/* Global Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-10">
          <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-6">
            <p className="text-xs text-muted-foreground font-semibold mb-1">Total Registered Users</p>
            <h3 className="text-3xl font-extrabold text-foreground">{data?.overview?.totalUsers || 0}</h3>
          </div>

          <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-6">
            <p className="text-xs text-muted-foreground font-semibold mb-1">Total Hackathons</p>
            <h3 className="text-3xl font-extrabold text-foreground">{data?.overview?.totalHackathons || 0}</h3>
          </div>

          <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-6">
            <p className="text-xs text-muted-foreground font-semibold mb-1">Total Teams</p>
            <h3 className="text-3xl font-extrabold text-foreground">{data?.overview?.totalTeams || 0}</h3>
          </div>

          <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-6">
            <p className="text-xs text-muted-foreground font-semibold mb-1">Total Submissions</p>
            <h3 className="text-3xl font-extrabold text-foreground">{data?.overview?.totalSubmissions || 0}</h3>
          </div>
        </div>

        {/* Recharts Analytics Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* User Role Distribution Chart */}
          <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-6">
            <h3 className="font-bold text-base text-foreground mb-4">Role Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roleDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {roleDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Admin Actions */}
          <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-6 space-y-4">
            <h3 className="font-bold text-base text-foreground mb-2">Platform Administration Modules</h3>

            <Link
              to="/admin/users"
              className="p-4 rounded-[var(--radius-md)] bg-background border border-border flex items-center justify-between hover:border-primary/40 transition-colors"
            >
              <div>
                <p className="font-semibold text-foreground text-sm">User Moderation & RBAC</p>
                <p className="text-xs text-muted-foreground">Block users, update roles (Participant, Organizer, Judge, Admin)</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </Link>

            <Link
              to="/admin/activity"
              className="p-4 rounded-[var(--radius-md)] bg-background border border-border flex items-center justify-between hover:border-primary/40 transition-colors"
            >
              <div>
                <p className="font-semibold text-foreground text-sm">System Activity Audit Logs</p>
                <p className="text-xs text-muted-foreground">Track registration, submission, judging, and publication events</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
