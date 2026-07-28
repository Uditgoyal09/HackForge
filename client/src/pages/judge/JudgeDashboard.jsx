import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, FolderGit2, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';
import { judgeService } from '../../services/judgeService';

const JudgeDashboard = () => {
  const [data, setData] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [dashRes, assignRes] = await Promise.all([
          dashboardService.getJudgeDashboard(),
          judgeService.getJudgeAssignments(),
        ]);
        if (dashRes.success) setData(dashRes.data);
        if (assignRes.success) setAssignments(assignRes.data || []);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white pt-24 p-6 max-w-7xl mx-auto space-y-6">
        <div className="h-40 rounded-3xl bg-slate-900/60 border border-slate-800 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="h-48 rounded-3xl bg-slate-900/60 border border-slate-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const assignedCount = assignments.length;

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800/80 rounded-3xl p-8 mb-10 shadow-2xl">
          <span className="text-xs font-mono uppercase font-bold text-indigo-400 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-3 inline-block">
            Judge Portal
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">Judge Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Review assigned hackathon submissions, evaluate dynamic criteria, and submit feedback.</p>
        </div>

        {/* Assigned Projects */}
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 sm:p-8">
          <h3 className="font-bold text-lg text-white mb-6">Assigned Projects ({assignedCount})</h3>

          {assignedCount === 0 ? (
            <div className="text-center py-16 text-slate-500 text-xs">
              No project assignments assigned to your account yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {assignments.map((assignment) => {
                const sub = assignment.submission || assignment;
                return (
                  <div key={assignment._id} className="p-6 rounded-3xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-base text-white">{sub.projectName}</h4>
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono uppercase">
                          Pending Review
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                        {sub.problemStatement}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {sub.techStack?.map((t, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-900 text-[10px] font-mono text-indigo-400">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800/60 flex items-center justify-end">
                      <Link
                        to={`/judge/assignments/${sub._id}`}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
                      >
                        Evaluate Submission <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JudgeDashboard;
