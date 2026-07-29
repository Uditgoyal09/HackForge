import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Search, Shield } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
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
    <div className="min-h-screen bg-background text-foreground pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <PageHeader 
          showBack 
          title={`Applications — ${hackathon?.title || 'Hackathon'}`}
          description="Review participant registrations and approve eligibility."
        />

        {/* Filters */}
        <div className="bg-surface border border-border rounded-3xl p-4 sm:p-6 mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search participant by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-input rounded-[var(--radius-md)] text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-background border border-input rounded-[var(--radius-md)] text-sm text-foreground focus:outline-none focus:border-primary"
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
              <div key={i} className="h-20 rounded-[var(--radius-lg)] bg-surface border border-border animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-surface border border-border rounded-[var(--radius-lg)] p-8">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-bold text-foreground">No Registrations Found</h3>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-[var(--radius-lg)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-elevated text-muted-foreground font-mono uppercase border-b border-border">
                  <tr>
                    <th className="p-4">Participant</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Registered Date</th>
                    <th className="p-4">Team Size</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((r) => {
                    const p = r.participant || {};
                    return (
                      <tr key={r._id} className="hover:bg-surface-hover">
                        <td className="p-4 font-semibold text-foreground">{p.name || 'Anonymous'}</td>
                        <td className="p-4 text-muted-foreground">{p.email}</td>
                        <td className="p-4 text-muted-foreground">{new Date(r.registeredAt || r.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 text-muted-foreground">{r.teamMembers?.length ? r.teamMembers.length + 1 : 1}</td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-[var(--radius-sm)] text-[10px] font-mono font-bold uppercase ${
                              r.status === 'approved'
                                ? 'bg-success/10 text-success border border-success/20'
                                : r.status === 'pending'
                                ? 'bg-warning/10 text-warning border border-warning/20'
                                : 'bg-error/10 text-error border border-error/20'
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
                                className="px-3 py-1.5 rounded-[var(--radius-md)] bg-success hover:bg-success/80 text-success-foreground font-semibold transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => setRejectModalId(r._id)}
                                className="px-3 py-1.5 rounded-[var(--radius-md)] bg-error/10 text-error hover:bg-error/20 font-semibold transition-colors"
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
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-6 max-w-md w-full text-foreground">
              <h3 className="font-bold text-lg mb-2">Reject Application</h3>
              <p className="text-xs text-muted-foreground mb-4">Provide a reason for rejecting this registration.</p>

              <form onSubmit={handleRejectSubmit} className="space-y-4">
                <textarea
                  rows={3}
                  placeholder="e.g. Prerequisites not met..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-input rounded-[var(--radius-md)] text-xs text-foreground focus:outline-none focus:border-primary"
                />

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setRejectModalId(null)}
                    className="px-4 py-2 rounded-[var(--radius-md)] bg-surface-elevated hover:bg-surface-hover text-foreground text-xs font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-[var(--radius-md)] bg-error hover:bg-error/90 text-error-foreground text-xs font-semibold transition-colors disabled:opacity-50"
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
