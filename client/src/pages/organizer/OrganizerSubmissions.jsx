import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FolderGit2, UserPlus, Trophy, ArrowLeft, ExternalLink } from 'lucide-react';
import { GithubIcon } from '../../components/common/SocialIcons';
import { submissionService } from '../../services/submissionService';
import { leaderboardService } from '../../services/leaderboardService';
import { hackathonService } from '../../services/hackathonService';
import JudgeAssignmentModal from './JudgeAssignmentModal';
import { toast } from 'sonner';

const OrganizerSubmissions = () => {
  const { id } = useParams();
  const [hackathon, setHackathon] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [hRes, subRes] = await Promise.all([
        hackathonService.getHackathonById(id),
        submissionService.getHackathonSubmissions(id),
      ]);

      if (hRes.success) setHackathon(hRes.data);
      if (subRes.success) setSubmissions(subRes.data || []);

      // Fetch leaderboard preview
      try {
        const lbRes = await leaderboardService.getLeaderboard(id);
        if (lbRes.success) setLeaderboard(lbRes.data || []);
      } catch {
        // Leaderboard preview might return error if no reviews submitted yet
      }
    } catch {
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handlePublishResults = async () => {
    if (!window.confirm('Are you sure you want to publish final results? This will lock all reviews and make the leaderboard public.')) return;

    setPublishing(true);
    try {
      const res = await leaderboardService.publishResults(id);
      if (res.success) {
        toast.success('Results published successfully!');
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to publish results');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link to="/organizer/dashboard" className="text-xs text-indigo-400 hover:underline flex items-center gap-1 mb-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Submissions & Judging — {hackathon?.title || 'Hackathon'}
            </h1>
            <p className="text-slate-400 text-sm mt-1">Review team deliverables, assign judges, and publish final rankings.</p>
          </div>

          {!hackathon?.resultsPublished ? (
            <button
              onClick={handlePublishResults}
              disabled={publishing}
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-xl shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-2"
            >
              <Trophy className="w-4 h-4" /> {publishing ? 'Publishing...' : 'Publish Leaderboard Results'}
            </button>
          ) : (
            <span className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold font-mono uppercase">
              Results Published
            </span>
          )}
        </div>

        {/* Submissions Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <div key={i} className="h-64 rounded-3xl bg-slate-900/60 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/30 border border-slate-800/50 rounded-3xl p-8">
            <FolderGit2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="font-bold text-slate-300">No Submissions Uploaded Yet</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {submissions.map((sub) => (
              <div key={sub._id} className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg text-white">{sub.projectName}</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-mono">
                      Team: {sub.team?.name || 'Team'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {sub.problemStatement}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {sub.techStack?.map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-950 text-[10px] font-mono text-indigo-400">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {sub.githubRepository && (
                      <a href={sub.githubRepository} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                        <GithubIcon className="w-3.5 h-3.5" /> Repo
                      </a>
                    )}
                    {sub.liveDemoUrl && (
                      <a href={sub.liveDemoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:underline flex items-center gap-1">
                        <ExternalLink className="w-3.5 h-3.5" /> Demo
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedSubmission(sub)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Assign Judge
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Calculated Leaderboard Preview Section */}
        {leaderboard.length > 0 && (
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 sm:p-8">
            <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" /> Leaderboard Ranking Preview
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-mono uppercase">
                  <tr>
                    <th className="p-3">Rank</th>
                    <th className="p-3">Team</th>
                    <th className="p-3">Project</th>
                    <th className="p-3">Average Score</th>
                    <th className="p-3">Reviews</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {leaderboard.map((item) => (
                    <tr key={item.submissionId} className="hover:bg-slate-900/40">
                      <td className="p-3 font-bold text-indigo-400">#{item.rank}</td>
                      <td className="p-3 font-semibold text-white">{item.team?.name}</td>
                      <td className="p-3 text-slate-300">{item.projectName}</td>
                      <td className="p-3 font-bold text-emerald-400">{item.averageScore?.toFixed(2)} / 100</td>
                      <td className="p-3 text-slate-400">{item.numberOfReviews} Submitted</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Judge Assignment Modal */}
        {selectedSubmission && (
          <JudgeAssignmentModal
            submission={selectedSubmission}
            onClose={() => setSelectedSubmission(null)}
            onSuccess={fetchData}
          />
        )}
      </div>
    </div>
  );
};

export default OrganizerSubmissions;
