import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Search, Shield, ArrowLeft } from 'lucide-react';
import { registrationService } from '../../services/registrationService';
import { hackathonService } from '../../services/hackathonService';
import { toast } from 'sonner';

const OrganizerRegistrations = () => {
  const { id } = useParams();
  const [hackathon, setHackathon] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Rejection Modal State
  const [rejectModalId, setRejectModalId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [hRes, regRes] = await Promise.all([
        hackathonService.getHackathonById(id),
        registrationService.getHackathonRegistrations(id),
      ]);

      if (hRes.success) setHackathon(hRes.data);
      if (regRes.success) setRegistrations(regRes.data);
    } catch {
      toast.error('Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleApprove = async (regId) => {
    try {
      await registrationService.approveRegistration(regId);
      toast.success('Registration approved');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve registration');
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectModalId) return;

    setActionLoading(true);
    try {
      await registrationService.rejectRegistration(rejectModalId, { rejectionReason });
      toast.success('Registration rejected');
      setRejectModalId(null);
      setRejectionReason('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject registration');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = registrations.filter(r => {
    const p = r.participant || {};
    const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase()) || p.email?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link to="/organizer/dashboard" className="text-xs text-indigo-400 hover:underline flex items-center gap-1 mb-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Applications — {hackathon?.title || 'Hackathon'}
            </h1>
            <p className="text-slate-400 text-sm mt-1">Review participant registrations and approve eligibility.</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-4 sm:p-6 mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search participant by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-slate-300"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/30 border border-slate-800/50 rounded-3xl p-8">
            <Shield className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="font-bold text-slate-300">No Registrations Found</h3>
          </div>
        ) : (
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-mono uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-4">Participant</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Registered Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filtered.map((r) => {
                    const p = r.participant || {};
                    return (
                      <tr key={r._id} className="hover:bg-slate-900/40">
                        <td className="p-4 font-semibold text-white">{p.name || 'Anonymous'}</td>
                        <td className="p-4 text-slate-400">{p.email}</td>
                        <td className="p-4 text-slate-500">{new Date(r.registeredAt || r.createdAt).toLocaleDateString()}</td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                              r.status === 'approved'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : r.status === 'pending'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {r.status === 'pending' && (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleApprove(r._id)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => setRejectModalId(r._id)}
                                className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 font-semibold"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Rejection Reason Modal */}
        {rejectModalId && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-white">
              <h3 className="font-bold text-lg mb-2">Reject Application</h3>
              <p className="text-xs text-slate-400 mb-4">Provide a reason for rejecting this registration.</p>

              <form onSubmit={handleRejectSubmit} className="space-y-4">
                <textarea
                  rows={3}
                  placeholder="e.g. Prerequisites not met..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setRejectModalId(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl bg-rose-600 text-xs font-semibold text-white"
                  >
                    Reject Application
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerRegistrations;
