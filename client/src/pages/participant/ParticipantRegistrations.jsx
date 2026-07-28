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
    <div className="min-h-screen bg-slate-950 text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">My Registrations</h1>
            <p className="text-slate-400 text-sm mt-1">Track application approval status and team formation eligibility.</p>
          </div>

          <Link
            to="/hackathons"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-lg shadow-indigo-600/25 self-start sm:self-auto"
          >
            Explore More Hackathons
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 rounded-3xl bg-slate-900/60 border border-slate-800/80 animate-pulse" />
            ))}
          </div>
        ) : registrations.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/30 border border-slate-800/50 rounded-3xl p-8 max-w-md mx-auto">
            <Shield className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="font-bold text-lg text-slate-300">No Registrations Yet</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Explore active hackathons and submit your registration.
            </p>
            <Link
              to="/hackathons"
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              Browse Hackathons
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
                  className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition-all"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg text-white">{h.title || 'Hackathon Event'}</h3>
                      <span
                        className={`px-3 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                          isApproved
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : isPending
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400">
                      Registered on: {new Date(r.registeredAt || r.createdAt).toLocaleDateString()}
                    </p>

                    {isRejected && r.rejectionReason && (
                      <p className="text-xs text-rose-400 mt-2 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                        Reason for rejection: {r.rejectionReason}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {isApproved && (
                      <Link
                        to="/participant/teams"
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-lg shadow-indigo-600/25"
                      >
                        Team & Submissions <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}

                    {isPending && (
                      <button
                        onClick={() => handleCancel(h._id)}
                        className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition-all"
                      >
                        Cancel
                      </button>
                    )}

                    <Link
                      to={`/hackathons/${h._id}`}
                      className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 text-xs font-semibold transition-all"
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
