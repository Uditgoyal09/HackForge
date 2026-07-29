import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Users, Shield } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
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
    <div className="min-h-screen bg-background text-foreground pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <PageHeader 
          showBack 
          title={`Formed Teams — ${hackathon?.title || 'Hackathon'}`}
          description="Review active participant teams and leaders."
        />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-44 rounded-[var(--radius-lg)] bg-surface border border-border animate-pulse" />
            ))}
          </div>
        ) : teams.length === 0 ? (
          <div className="text-center py-16 bg-surface border border-border rounded-[var(--radius-lg)] p-8">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-bold text-foreground">No Teams Formed Yet</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teams.map((t) => (
              <div key={t._id} className="bg-surface-elevated border border-border rounded-[var(--radius-lg)] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg text-foreground">{t.name}</h3>
                  <span className="px-2.5 py-0.5 rounded-[var(--radius-sm)] bg-primary-soft text-foreground text-[10px] font-mono">
                    {t.members?.length} Members
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-4">Leader: {t.leader?.name || 'Unknown'}</p>

                <div className="pt-4 border-t border-border">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Members</p>
                  <div className="space-y-1 text-xs text-foreground">
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
