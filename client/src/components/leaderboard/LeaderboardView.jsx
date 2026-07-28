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
      <div className="min-h-screen bg-slate-950 text-white pt-24 p-6 max-w-7xl mx-auto space-y-6">
        <div className="h-64 rounded-3xl bg-slate-900/60 border border-slate-800 animate-pulse" />
      </div>
    );
  }

  if (isUnpublished) {
    return (
      <div className="min-h-screen bg-slate-950 text-white pt-24 p-6 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold mb-2">Results Not Published Yet</h2>
        <p className="text-slate-400 text-sm max-w-md mb-6">
          The event organizer has not published the official leaderboard results for this hackathon yet.
        </p>
        <Link to={`/hackathons/${id}`} className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold">
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
    <div className="min-h-screen bg-slate-950 text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="mb-10 text-center">
          <Link to={`/hackathons/${id}`} className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:underline mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Hackathon Details
          </Link>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Official Leaderboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">{hackathon?.title}</p>
        </div>

        {/* Top 3 Podium */}
        {top3.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 items-end">
            {/* 2nd Place */}
            {second ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 text-center order-2 md:order-1 relative overflow-hidden">
                <div className="w-12 h-12 rounded-2xl bg-slate-400/20 text-slate-300 font-extrabold flex items-center justify-center mx-auto mb-3 text-lg border border-slate-400/30">
                  2nd
                </div>
                <h3 className="font-bold text-lg text-white truncate">{second.team?.name}</h3>
                <p className="text-xs text-slate-400 mb-3 truncate">{second.projectName}</p>
                <div className="inline-block px-3 py-1 rounded-full bg-slate-800 text-slate-200 font-mono font-bold text-xs">
                  {second.averageScore?.toFixed(2)} Pts
                </div>
              </div>
            ) : <div className="hidden md:block order-1" />}

            {/* 1st Place Champion */}
            {first && (
              <div className="bg-gradient-to-b from-indigo-950/80 to-slate-900 border-2 border-amber-500/40 rounded-3xl p-8 text-center order-1 md:order-2 shadow-2xl shadow-amber-500/10 relative overflow-hidden">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 font-extrabold flex items-center justify-center mx-auto mb-4 text-xl border border-amber-500/40 shadow-lg shadow-amber-500/20">
                  <Trophy className="w-8 h-8" />
                </div>
                <span className="text-[10px] font-mono font-extrabold uppercase px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-2 inline-block">
                  CHAMPION
                </span>
                <h3 className="font-extrabold text-2xl text-white truncate">{first.team?.name}</h3>
                <p className="text-xs text-slate-300 mb-4 truncate">{first.projectName}</p>
                <div className="inline-block px-4 py-1.5 rounded-full bg-amber-500 text-slate-950 font-mono font-extrabold text-sm shadow-md shadow-amber-500/30">
                  {first.averageScore?.toFixed(2)} Pts
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {third ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 text-center order-3 relative overflow-hidden">
                <div className="w-12 h-12 rounded-2xl bg-amber-700/20 text-amber-500 font-extrabold flex items-center justify-center mx-auto mb-3 text-lg border border-amber-700/30">
                  3rd
                </div>
                <h3 className="font-bold text-lg text-white truncate">{third.team?.name}</h3>
                <p className="text-xs text-slate-400 mb-3 truncate">{third.projectName}</p>
                <div className="inline-block px-3 py-1 rounded-full bg-slate-800 text-slate-200 font-mono font-bold text-xs">
                  {third.averageScore?.toFixed(2)} Pts
                </div>
              </div>
            ) : <div className="hidden md:block order-3" />}
          </div>
        )}

        {/* Deterministic Ranking Table */}
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-mono uppercase border-b border-slate-800">
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
              <tbody className="divide-y divide-slate-800/60">
                {leaderboard.map((entry) => (
                  <tr key={entry.submissionId} className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-indigo-400">#{entry.rank}</td>
                    <td className="p-4 font-semibold text-white">{entry.team?.name}</td>
                    <td className="p-4 text-slate-300">{entry.projectName}</td>
                    <td className="p-4 font-extrabold text-emerald-400">{entry.averageScore?.toFixed(2)}</td>
                    <td className="p-4 text-slate-400">{entry.tieBreakers?.innovation?.toFixed(1) || '-'}</td>
                    <td className="p-4 text-slate-400">{entry.tieBreakers?.technical?.toFixed(1) || '-'}</td>
                    <td className="p-4 text-right text-slate-400">{entry.numberOfReviews}</td>
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
