import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Users, Shield, ArrowLeft } from 'lucide-react';
import api from '../../services/api';
import { hackathonService } from '../../services/hackathonService';

const OrganizerTeams = () => {
  const { id } = useParams();
  const [hackathon, setHackathon] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [hRes, tRes] = await Promise.all([
          hackathonService.getHackathonById(id),
          api.get(`/hackathons/${id}/teams`),
        ]);
        if (hRes.success) setHackathon(hRes.data);
        if (tRes.data?.success) setTeams(tRes.data.data || []);
      } catch {
        setTeams([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="mb-8">
          <Link to="/organizer/dashboard" className="text-xs text-indigo-400 hover:underline flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Formed Teams — {hackathon?.title || 'Hackathon'}
          </h1>
          <p className="text-slate-400 text-sm mt-1">Review active participant teams and leaders.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-44 rounded-3xl bg-slate-900/60 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : teams.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/30 border border-slate-800/50 rounded-3xl p-8">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="font-bold text-slate-300">No Teams Formed Yet</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teams.map((t) => (
              <div key={t._id} className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg text-white">{t.name}</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-mono">
                    {t.members?.length} Members
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-4">Leader: {t.leader?.name || 'Unknown'}</p>

                <div className="pt-4 border-t border-slate-800/60">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Members</p>
                  <div className="space-y-1 text-xs text-slate-300">
                    {t.members?.map((m) => (
                      <p key={m._id || m}>• {m.name || m.email || m}</p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerTeams;
