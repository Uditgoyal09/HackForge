import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, Trophy, FolderGit2, Plus, ShieldCheck, ArrowRight } from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';

const OrganizerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await dashboardService.getOrganizerAnalytics();
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
        <div className="h-40 rounded-3xl bg-slate-900/60 border border-slate-800/80 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-36 rounded-3xl bg-slate-900/60 border border-slate-800/80 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const hackathonsCount = data?.myHackathons?.length || 0;
  const totalRegistrations = data?.totalRegistrations || 0;
  const totalTeams = data?.totalTeams || 0;
  const totalSubmissions = data?.totalSubmissions || 0;

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800/80 rounded-3xl p-8 mb-10 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-mono uppercase font-bold text-indigo-400 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-3 inline-block">
              Organizer Portal
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight">Organizer Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">Manage competitions, review applications, assign judges, and publish rankings.</p>
          </div>

          <Link
            to="/organizer/hackathons/create"
            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-xl shadow-indigo-600/30 flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Create Hackathon
          </Link>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-10">
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6">
            <p className="text-xs text-slate-400 font-semibold mb-1">My Events</p>
            <h3 className="text-3xl font-extrabold text-white">{hackathonsCount}</h3>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6">
            <p className="text-xs text-slate-400 font-semibold mb-1">Total Registrations</p>
            <h3 className="text-3xl font-extrabold text-white">{totalRegistrations}</h3>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6">
            <p className="text-xs text-slate-400 font-semibold mb-1">Formed Teams</p>
            <h3 className="text-3xl font-extrabold text-white">{totalTeams}</h3>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6">
            <p className="text-xs text-slate-400 font-semibold mb-1">Project Submissions</p>
            <h3 className="text-3xl font-extrabold text-white">{totalSubmissions}</h3>
          </div>
        </div>

        {/* Hackathon Management List */}
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 sm:p-8">
          <h3 className="font-bold text-lg text-white mb-6">Hosted Hackathons</h3>

          {hackathonsCount === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              You haven't created any hackathons yet. Click "Create Hackathon" to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {data.myHackathons.map((h) => (
                <div key={h._id} className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-bold text-base text-white">{h.title}</h4>
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-mono uppercase">
                        {h.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Prize Pool: ${h.prizePool?.toLocaleString()} • Mode: {h.mode}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/organizer/hackathons/${h._id}/registrations`}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-300"
                    >
                      Applications
                    </Link>
                    <Link
                      to={`/organizer/hackathons/${h._id}/teams`}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-300"
                    >
                      Teams
                    </Link>
                    <Link
                      to={`/organizer/hackathons/${h._id}/submissions`}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600/10 border border-indigo-500/20 hover:bg-indigo-600/20 text-xs font-semibold text-indigo-300"
                    >
                      Submissions & Judging
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
