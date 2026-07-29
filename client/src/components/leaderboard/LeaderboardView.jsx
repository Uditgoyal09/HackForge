import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Trophy, Medal, Award, Lock, ArrowLeft } from 'lucide-react';
import { leaderboardService } from '../../services/leaderboardService';
import { hackathonService } from '../../services/hackathonService';
import { toast } from 'sonner';

const LeaderboardView = () => {
  const { id } = useParams();
  const [hackathon, setHackathon] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUnpublished, setIsUnpublished] = useState(false);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const [hRes, lbRes] = await Promise.all([
          hackathonService.getHackathonById(id),
          leaderboardService.getLeaderboard(id),
        ]);

        if (hRes.success) setHackathon(hRes.data);
        if (lbRes.success && lbRes.data) {
          setLeaderboard(lbRes.data);
        }
      } catch (err) {
        if (err.response?.status === 403) {
          setIsUnpublished(true);
        } else {
          toast.error('Failed to load leaderboard');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground pt-24 p-6 max-w-7xl mx-auto space-y-6">
        <div className="h-64 rounded-[var(--radius-lg)] bg-surface/60 border border-border animate-pulse" />
      </div>
    );
  }

  if (isUnpublished) {
    return (
      <div className="min-h-screen bg-background text-foreground pt-24 p-6 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-[var(--radius-lg)] bg-warning/10 border border-warning/20 text-warning flex items-center justify-center mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold mb-2">Results Not Published Yet</h2>
        <p className="text-muted-foreground text-sm max-w-md mb-6">
          The event organizer has not published the official leaderboard results for this hackathon yet.
        </p>
        <Link to={`/hackathons/${id}`} className="px-5 py-2.5 rounded-[var(--radius-md)] bg-primary text-primary-foreground text-xs font-semibold">
          Return to Event Overview
        </Link>
      </div>
    );
  }

  const top3 = leaderboard.slice(0, 3);
  const first = top3[0];
  const second = top3[1];
  const third = top3[2];
  const remaining = leaderboard.slice(3);

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="mb-10 text-center">
          <Link to={`/hackathons/${id}`} className="inline-flex items-center gap-1 text-xs text-primary hover:underline mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Hackathon Details
          </Link>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Official Leaderboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{hackathon?.title}</p>
        </div>

        {/* Top 3 Podium */}
        {top3.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 items-end">
            {/* 2nd Place */}
            {second ? (
              <div className="bg-surface/60 border border-border rounded-[var(--radius-lg)] p-6 text-center order-2 md:order-1 relative overflow-hidden">
                <div className="w-12 h-12 rounded-[var(--radius-md)] bg-muted-foreground/20 text-muted-foreground font-extrabold flex items-center justify-center mx-auto mb-3 text-lg border border-muted-foreground/30">
                  2nd
                </div>
                <h3 className="font-bold text-lg text-foreground truncate">{second.team?.name}</h3>
                <p className="text-xs text-muted-foreground mb-3 truncate">{second.projectName}</p>
                <div className="inline-block px-3 py-1 rounded-full bg-surface-elevated text-foreground font-mono font-bold text-xs">
                  {second.averageScore?.toFixed(2)} Pts
                </div>
              </div>
            ) : <div className="hidden md:block order-1" />}

            {/* 1st Place Champion */}
            {first && (
              <div className="bg-gradient-to-b from-primary/20 to-background border-2 border-primary/40 rounded-[var(--radius-lg)] p-8 text-center order-1 md:order-2 shadow-2xl shadow-primary/10 relative overflow-hidden">
                <div className="w-16 h-16 rounded-[var(--radius-md)] bg-primary/20 text-primary font-extrabold flex items-center justify-center mx-auto mb-4 text-xl border border-primary/40 shadow-lg shadow-primary/20">
                  <Trophy className="w-8 h-8" />
                </div>
                <span className="text-[10px] font-mono font-extrabold uppercase px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 mb-2 inline-block">
                  CHAMPION
                </span>
                <h3 className="font-extrabold text-2xl text-foreground truncate">{first.team?.name}</h3>
                <p className="text-xs text-muted-foreground mb-4 truncate">{first.projectName}</p>
                <div className="inline-block px-4 py-1.5 rounded-full bg-primary text-primary-foreground font-mono font-extrabold text-sm shadow-md shadow-primary/30">
                  {first.averageScore?.toFixed(2)} Pts
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {third ? (
              <div className="bg-surface/60 border border-border rounded-[var(--radius-lg)] p-6 text-center order-3 relative overflow-hidden">
                <div className="w-12 h-12 rounded-[var(--radius-md)] bg-warning/20 text-warning font-extrabold flex items-center justify-center mx-auto mb-3 text-lg border border-warning/30">
                  3rd
                </div>
                <h3 className="font-bold text-lg text-foreground truncate">{third.team?.name}</h3>
                <p className="text-xs text-muted-foreground mb-3 truncate">{third.projectName}</p>
                <div className="inline-block px-3 py-1 rounded-full bg-surface-elevated text-foreground font-mono font-bold text-xs">
                  {third.averageScore?.toFixed(2)} Pts
                </div>
              </div>
            ) : <div className="hidden md:block order-3" />}
          </div>
        )}

        {/* Deterministic Ranking Table */}
        <div className="bg-surface/50 border border-border/80 rounded-[var(--radius-lg)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-background text-muted-foreground font-mono uppercase border-b border-border">
                <tr>
                  <th className="p-4">Rank</th>
                  <th className="p-4">Team Name</th>
                  <th className="p-4">Project Title</th>
                  <th className="p-4">Average Score</th>
                  <th className="p-4">Innovation Score</th>
                  <th className="p-4">Technical Score</th>
                  <th className="p-4 text-right">Reviews</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {leaderboard.map((entry) => (
                  <tr key={entry.submissionId} className="hover:bg-surface-hover">
                    <td className="p-4 font-bold text-primary">#{entry.rank}</td>
                    <td className="p-4 font-semibold text-foreground">{entry.team?.name}</td>
                    <td className="p-4 text-muted-foreground">{entry.projectName}</td>
                    <td className="p-4 font-extrabold text-success">{entry.averageScore?.toFixed(2)}</td>
                    <td className="p-4 text-muted-foreground">{entry.tieBreakers?.innovation?.toFixed(1) || '-'}</td>
                    <td className="p-4 text-muted-foreground">{entry.tieBreakers?.technical?.toFixed(1) || '-'}</td>
                    <td className="p-4 text-right text-muted-foreground">{entry.numberOfReviews}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardView;
