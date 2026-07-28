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
      <div className="min-h-screen bg-slate-950 text-white pt-24 p-6 max-w-7xl mx-auto space-y-6">
        <div className="h-40 rounded-3xl bg-slate-900/60 border border-slate-800 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 rounded-3xl bg-slate-900/60 border border-slate-800 animate-pulse" />
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
    <div className="min-h-screen bg-slate-950 text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800/80 rounded-3xl p-8 mb-10 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-mono uppercase font-bold text-rose-400 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 mb-3 inline-block">
              Super Admin Portal
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight">System Control & Analytics</h1>
            <p className="text-slate-400 text-sm mt-1">Platform-wide statistics, user moderation, role security, and audit logs.</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/users"
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20"
            >
              User Management
            </Link>
            <Link
              to="/admin/activity"
              className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-300"
            >
              Audit Logs
            </Link>
          </div>
        </div>

        {/* Global Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-10">
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6">
            <p className="text-xs text-slate-400 font-semibold mb-1">Total Registered Users</p>
            <h3 className="text-3xl font-extrabold text-white">{data?.overview?.totalUsers || 0}</h3>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6">
            <p className="text-xs text-slate-400 font-semibold mb-1">Total Hackathons</p>
            <h3 className="text-3xl font-extrabold text-white">{data?.overview?.totalHackathons || 0}</h3>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6">
            <p className="text-xs text-slate-400 font-semibold mb-1">Total Teams</p>
            <h3 className="text-3xl font-extrabold text-white">{data?.overview?.totalTeams || 0}</h3>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6">
            <p className="text-xs text-slate-400 font-semibold mb-1">Total Submissions</p>
            <h3 className="text-3xl font-extrabold text-white">{data?.overview?.totalSubmissions || 0}</h3>
          </div>
        </div>

        {/* Recharts Analytics Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* User Role Distribution Chart */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6">
            <h3 className="font-bold text-base text-white mb-4">Role Distribution</h3>
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
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 space-y-4">
            <h3 className="font-bold text-base text-white mb-2">Platform Administration Modules</h3>

            <Link
              to="/admin/users"
              className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between hover:border-indigo-500/40 transition-colors"
            >
              <div>
                <p className="font-semibold text-white text-sm">User Moderation & RBAC</p>
                <p className="text-xs text-slate-400">Block users, update roles (Participant, Organizer, Judge, Admin)</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500" />
            </Link>

            <Link
              to="/admin/activity"
              className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between hover:border-indigo-500/40 transition-colors"
            >
              <div>
                <p className="font-semibold text-white text-sm">System Activity Audit Logs</p>
                <p className="text-xs text-slate-400">Track registration, submission, judging, and publication events</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
