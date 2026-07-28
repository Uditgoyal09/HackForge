import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Users, Trophy, FolderGit2, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';
import { useAuth } from '../../context/AuthContext';

const ParticipantDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const res = await dashboardService.getParticipantDashboard();
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white pt-24 p-6 max-w-7xl mx-auto space-y-6">
        <div className="h-40 rounded-3xl bg-slate-900/60 border border-slate-800/80 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 rounded-3xl bg-slate-900/60 border border-slate-800/80 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const registrationsCount = data?.myRegistrations?.length || 0;
  const activeTeamsCount = data?.myTeams?.length || 0;
  const submissionsCount = data?.mySubmissions?.length || 0;

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800/80 rounded-3xl p-8 mb-10 shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-xs font-mono uppercase font-bold text-indigo-400 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-3 inline-block">
              Participant Portal
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight">Welcome back, {user?.name}!</h1>
            <p className="text-slate-400 text-sm mt-1">Track your registered hackathons, team status, and project submissions.</p>
          </div>
        </div>

        {/* 6-Stage Journey Timeline */}
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 sm:p-8 mb-10">
          <h3 className="font-bold text-sm text-slate-300 mb-6 uppercase tracking-wider font-mono">
            Hackathon Lifecycle Journey
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-center text-xs">
            <div className={`p-3 rounded-2xl border ${registrationsCount > 0 ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-300' : 'bg-slate-950/60 border-slate-800 text-slate-500'}`}>
              <div className="font-bold mb-1">1. Register</div>
              <div className="text-[10px]">{registrationsCount > 0 ? 'Completed' : 'Pending'}</div>
            </div>

            <div className={`p-3 rounded-2xl border ${activeTeamsCount > 0 ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-300' : 'bg-slate-950/60 border-slate-800 text-slate-500'}`}>
              <div className="font-bold mb-1">2. Form Team</div>
              <div className="text-[10px]">{activeTeamsCount > 0 ? 'Active' : 'Not Joined'}</div>
            </div>

            <div className={`p-3 rounded-2xl border ${registrationsCount > 0 ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-300' : 'bg-slate-950/60 border-slate-800 text-slate-500'}`}>
              <div className="font-bold mb-1">3. Approval</div>
              <div className="text-[10px]">Organizer Status</div>
            </div>

            <div className={`p-3 rounded-2xl border ${submissionsCount > 0 ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-300' : 'bg-slate-950/60 border-slate-800 text-slate-500'}`}>
              <div className="font-bold mb-1">4. Submit Project</div>
              <div className="text-[10px]">{submissionsCount > 0 ? 'Submitted' : 'Pending'}</div>
            </div>

            <div className="p-3 rounded-2xl border bg-slate-950/60 border-slate-800 text-slate-500">
              <div className="font-bold mb-1">5. Under Review</div>
              <div className="text-[10px]">Judging Phase</div>
            </div>

            <div className="p-3 rounded-2xl border bg-slate-950/60 border-slate-800 text-slate-500">
              <div className="font-bold mb-1">6. Results</div>
              <div className="text-[10px]">Leaderboard</div>
            </div>
          </div>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-semibold mb-1">Registrations</p>
              <h3 className="text-3xl font-extrabold text-white">{registrationsCount}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-semibold mb-1">Active Teams</p>
              <h3 className="text-3xl font-extrabold text-white">{activeTeamsCount}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-violet-600/10 border border-violet-500/20 text-violet-400 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-semibold mb-1">Submissions</p>
              <h3 className="text-3xl font-extrabold text-white">{submissionsCount}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-600/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <FolderGit2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/participant/registrations"
            className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800/60 hover:border-indigo-500/40 transition-all flex items-center justify-between group"
          >
            <div>
              <h4 className="font-bold text-white mb-1">My Registrations</h4>
              <p className="text-xs text-slate-400">View application approvals and status.</p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
          </Link>

          <Link
            to="/participant/teams"
            className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800/60 hover:border-indigo-500/40 transition-all flex items-center justify-between group"
          >
            <div>
              <h4 className="font-bold text-white mb-1">Team Management</h4>
              <p className="text-xs text-slate-400">Manage teams, invite members, or accept invites.</p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
          </Link>

          <Link
            to="/participant/submissions"
            className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800/60 hover:border-indigo-500/40 transition-all flex items-center justify-between group"
          >
            <div>
              <h4 className="font-bold text-white mb-1">Project Submissions</h4>
              <p className="text-xs text-slate-400">Create or edit project submissions.</p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ParticipantDashboard;
