import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, FolderGit2, CheckCircle2, Clock, ArrowRight, Calendar } from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';
import { judgeService } from '../../services/judgeService';

const JudgeDashboard = () => {
  const [data, setData] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [dashRes, assignRes, hackRes] = await Promise.all([
          dashboardService.getJudgeDashboard(),
          judgeService.getJudgeAssignments(),
          judgeService.getJudgeHackathons()
        ]);
        if (dashRes.success) setData(dashRes.data);
        if (assignRes.success) setAssignments(assignRes.data || []);
        if (hackRes.success) setHackathons(hackRes.data || []);
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
      <div className="min-h-screen bg-background text-foreground pt-24 p-6 max-w-7xl mx-auto space-y-6">
        <div className="h-40 rounded-[var(--radius-lg)] bg-surface-elevated border border-border animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="h-48 rounded-[var(--radius-lg)] bg-surface-elevated border border-border animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const assignedCount = assignments.length;

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="bg-gradient-to-r from-surface via-primary/10 to-surface border border-border rounded-[var(--radius-lg)] p-8 mb-10 shadow-2xl">
          <span className="text-xs font-mono uppercase font-bold text-primary px-3 py-1 rounded-[var(--radius-sm)] bg-primary/10 border border-primary/20 mb-3 inline-block">
            Judge Portal
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">Judge Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Review assigned hackathon submissions, evaluate dynamic criteria, and submit feedback.</p>
        </div>

        {/* Assigned Hackathons */}
        <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-6 sm:p-8 mb-8">
          <h3 className="font-bold text-lg text-foreground mb-6 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Hackathon Judge Pools
          </h3>
          
          {hackathons.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm bg-background rounded-[var(--radius-md)] border border-border border-dashed">
              You haven't been added to any hackathon judge pools yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hackathons.map((h) => (
                <Link key={h._id} to={`/judge/hackathons/${h._id}`} className="block group">
                  <div className="bg-background border border-border rounded-[var(--radius-lg)] p-5 h-full transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-foreground line-clamp-1">{h.title}</h4>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(h.startDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-1 bg-primary/10 text-primary rounded-[var(--radius-sm)]">
                        Active Pool
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Assigned Projects */}
        <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-6 sm:p-8">
          <h3 className="font-bold text-lg text-foreground mb-6">Assigned Projects ({assignedCount})</h3>

          {assignedCount === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-xs">
              No project assignments assigned to your account yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {assignments.map((assignment) => {
                const sub = assignment.submission || assignment;
                return (
                  <div key={assignment._id} className="p-6 rounded-[var(--radius-lg)] bg-background border border-border flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-base text-foreground">{sub.projectName}</h4>
                        <span className="px-2.5 py-0.5 rounded-[var(--radius-sm)] bg-warning/10 text-warning border border-warning/20 text-[10px] font-mono uppercase">
                          Pending Review
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">
                        {sub.problemStatement}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {sub.techStack?.map((t, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-[var(--radius-sm)] bg-surface-elevated text-[10px] font-mono text-primary border border-border">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border flex items-center justify-end">
                      <Link
                        to={`/judge/assignments/${sub._id}`}
                        className="px-4 py-2 rounded-[var(--radius-md)] bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs transition-all shadow-md shadow-primary/20 flex items-center gap-1.5"
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
