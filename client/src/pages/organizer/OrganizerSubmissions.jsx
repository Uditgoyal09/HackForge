import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FolderGit2, UserPlus, Trophy, ExternalLink } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
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
    <div className="min-h-screen bg-background text-foreground pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <PageHeader 
          showBack 
          title={`Submissions & Judging — ${hackathon?.title || 'Hackathon'}`}
          description="Review team deliverables, assign judges, and publish final rankings."
          actions={
            !hackathon?.resultsPublished ? (
              <button
                onClick={handlePublishResults}
                disabled={publishing}
                className="px-6 py-3 rounded-[var(--radius-md)] bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs transition-all shadow-xl shadow-primary/20 disabled:opacity-50 flex items-center gap-2"
              >
                <Trophy className="w-4 h-4" /> {publishing ? 'Publishing...' : 'Publish Leaderboard Results'}
              </button>
            ) : (
              <span className="px-4 py-2 rounded-[var(--radius-md)] bg-success/10 border border-success/20 text-success text-xs font-bold font-mono uppercase">
                Results Published
              </span>
            )
          }
        />

        {/* Submissions Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <div key={i} className="h-64 rounded-[var(--radius-lg)] bg-surface border border-border animate-pulse" />
            ))}
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-16 bg-surface border border-border rounded-[var(--radius-lg)] p-8">
            <FolderGit2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-bold text-foreground">No Submissions Uploaded Yet</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {submissions.map((sub) => (
              <div key={sub._id} className="bg-surface-elevated border border-border rounded-[var(--radius-lg)] p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg text-foreground">{sub.projectName}</h3>
                    <span className="px-2.5 py-0.5 rounded-[var(--radius-sm)] bg-primary-soft text-foreground border border-primary/20 text-[10px] font-mono">
                      Team: {sub.team?.name || 'Team'}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">
                    {sub.problemStatement}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {sub.techStack?.map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-[var(--radius-sm)] bg-background border border-border text-[10px] font-mono text-primary">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {sub.githubRepository && (
                      <a href={sub.githubRepository} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                        <GithubIcon className="w-3.5 h-3.5" /> Repo
                      </a>
                    )}
                    {sub.liveDemoUrl && (
                      <a href={sub.liveDemoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                        <ExternalLink className="w-3.5 h-3.5" /> Demo
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedSubmission(sub)}
                    className="px-4 py-2 rounded-[var(--radius-md)] bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs transition-all shadow-md shadow-primary/20 flex items-center gap-1.5"
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
          <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-6 sm:p-8">
            <h3 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-warning" /> Leaderboard Ranking Preview
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-elevated text-muted-foreground font-mono uppercase">
                  <tr>
                    <th className="p-3">Rank</th>
                    <th className="p-3">Team</th>
                    <th className="p-3">Project</th>
                    <th className="p-3">Average Score</th>
                    <th className="p-3">Reviews</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {leaderboard.map((item) => (
                    <tr key={item.submissionId} className="hover:bg-surface-hover">
                      <td className="p-3 font-bold text-primary">#{item.rank}</td>
                      <td className="p-3 font-semibold text-foreground">{item.team?.name}</td>
                      <td className="p-3 text-foreground">{item.projectName}</td>
                      <td className="p-3 font-bold text-success">{item.averageScore?.toFixed(2)} / 100</td>
                      <td className="p-3 text-muted-foreground">{item.numberOfReviews} Submitted</td>
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
