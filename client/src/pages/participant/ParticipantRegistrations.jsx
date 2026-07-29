import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CheckCircle2, Clock, XCircle, ArrowRight, Shield } from 'lucide-react';
import { registrationService } from '../../services/registrationService';
import { toast } from 'sonner';

const ParticipantRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const res = await registrationService.getMyRegistrations();
      if (res.success && res.data) {
        setRegistrations(res.data);
      }
    } catch {
      toast.error('Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleCancel = async (hackathonId) => {
    if (!window.confirm('Are you sure you want to cancel your registration for this hackathon?')) return;

    try {
      await registrationService.cancelRegistration(hackathonId);
      toast.success('Registration cancelled');
      fetchRegistrations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel registration');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">My Registrations</h1>
            <p className="text-muted-foreground text-sm mt-1">Track application approval status and team formation eligibility.</p>
          </div>

          <Link
            to="/hackathons"
            className="px-5 py-2.5 rounded-[var(--radius-md)] bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-semibold transition-all shadow-lg shadow-primary/25 self-start sm:self-auto"
          >
            Explore More Hackathons
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 rounded-[var(--radius-lg)] bg-surface border border-border animate-pulse shadow-sm" />
            ))}
          </div>
        ) : registrations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-surface/50 border border-border border-dashed rounded-[var(--radius-xl)] text-center max-w-3xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-surface-elevated border border-border flex items-center justify-center mb-6">
              <Shield className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-bold text-xl text-foreground mb-2">No Registrations Yet</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
              You haven't registered for any hackathons yet. Explore active opportunities to start building.
            </p>
            <Link
              to="/hackathons"
              className="inline-flex items-center justify-center h-11 px-6 rounded-[10px] bg-primary text-primary-foreground font-semibold hover:-translate-y-[2px] hover:shadow-[0_0_15px_rgba(182,255,0,0.3)] active:scale-[0.98] transition-all duration-200"
            >
              Browse Hackathons <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {registrations.map((r) => {
              const h = r.hackathon || {};
              const isApproved = r.status === 'approved';
              const isPending = r.status === 'pending';
              const isRejected = r.status === 'rejected';

              return (
                <div
                  key={r._id}
                  className="bg-surface border border-border rounded-[var(--radius-lg)] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/50 transition-all"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg text-foreground">{h.title || 'Hackathon Event'}</h3>
                      <span
                        className={`px-3 py-0.5 rounded-[var(--radius-sm)] text-[10px] font-mono font-bold uppercase ${
                          isApproved
                            ? 'bg-success/10 text-success border border-success/20'
                            : isPending
                            ? 'bg-warning/10 text-warning border border-warning/20'
                            : 'bg-error/10 text-error border border-error/20'
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Registered on: {new Date(r.registeredAt || r.createdAt).toLocaleDateString()}
                    </p>

                    {isRejected && r.rejectionReason && (
                      <p className="text-xs text-error mt-2 bg-error/10 p-2.5 rounded-[var(--radius-md)] border border-error/20">
                        Reason for rejection: {r.rejectionReason}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {isApproved && (
                      <Link
                        to="/participant/teams"
                        className="px-4 py-2 rounded-[var(--radius-md)] bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-semibold transition-all flex items-center gap-1.5 shadow-lg shadow-primary/25"
                      >
                        Team & Submissions <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}

                    {isPending && (
                      <button
                        onClick={() => handleCancel(h._id)}
                        className="px-4 py-2 rounded-[var(--radius-md)] bg-background border border-border text-error hover:bg-error/10 text-xs font-semibold transition-all"
                      >
                        Cancel
                      </button>
                    )}

                    <Link
                      to={`/hackathons/${h._id}`}
                      className="px-4 py-2 rounded-[var(--radius-md)] bg-surface border border-border text-foreground hover:bg-surface-hover text-xs font-semibold transition-all"
                    >
                      View Event
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantRegistrations;
