import React, { useState, useEffect } from 'react';
import { Shield, Key, Plus, Copy, Check, AlertTriangle, X } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { toast } from 'sonner';

const AdminAccessCodes = () => {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Code Form Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [role, setRole] = useState('organizer');
  const [label, setLabel] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [maxUses, setMaxUses] = useState(1);
  const [creating, setCreating] = useState(false);

  // One-Time Reveal Modal
  const [revealedCode, setRevealedCode] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchCodes = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAccessCodes();
      if (res.success && res.data) {
        setCodes(res.data);
      }
    } catch {
      toast.error('Failed to load access codes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!label.trim() || !expiresAt) {
      toast.error('Please fill in all required fields');
      return;
    }

    setCreating(true);
    try {
      const res = await adminService.createAccessCode({
        role,
        label,
        expiresAt,
        maxUses,
      });

      if (res.success && res.rawCode) {
        toast.success('Access code generated successfully!');
        setRevealedCode(res.rawCode);
        setIsModalOpen(false);
        setLabel('');
        setExpiresAt('');
        setMaxUses(1);
        fetchCodes();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create access code');
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id) => {
    if (!window.confirm('Are you sure you want to revoke this access code? It will immediately become unusable.')) return;

    try {
      await adminService.revokeAccessCode(id);
      toast.success('Access code revoked');
      fetchCodes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to revoke access code');
    }
  };

  const handleCopyCode = () => {
    if (revealedCode) {
      navigator.clipboard.writeText(revealedCode);
      setCopied(true);
      toast.success('Access code copied to clipboard!');
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-mono uppercase font-bold text-error px-3 py-1 rounded-[var(--radius-sm)] bg-error/10 border border-error/20 mb-3 inline-block">
              Security Control
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight">Role Verification Access Codes</h1>
            <p className="text-muted-foreground text-sm mt-1">Generate and manage cryptographically hashed verification codes for Organizers and Judges.</p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-3 rounded-[var(--radius-md)] bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs transition-all shadow-xl shadow-primary/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Generate Access Code
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 rounded-[var(--radius-lg)] bg-surface-elevated border border-border animate-pulse" />
            ))}
          </div>
        ) : codes.length === 0 ? (
          <div className="text-center py-16 bg-surface border border-border rounded-[var(--radius-lg)] p-8">
            <Key className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-bold text-foreground">No Access Codes Generated</h3>
            <p className="text-xs text-muted-foreground mt-1">Click above to generate verification codes for Organizers or Judges.</p>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-[var(--radius-lg)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-background text-muted-foreground font-mono uppercase border-b border-border">
                  <tr>
                    <th className="p-4">Role Target</th>
                    <th className="p-4">Label / Description</th>
                    <th className="p-4">Usage</th>
                    <th className="p-4">Expires At</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Created By</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {codes.map((c) => (
                    <tr key={c._id} className="hover:bg-surface-hover">
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-[var(--radius-sm)] text-[10px] font-mono uppercase font-bold border ${
                          c.role === 'organizer'
                            ? 'bg-primary/10 text-primary border-primary/20'
                            : 'bg-primary/10 text-primary border-primary/20'
                        }`}>
                          {c.role}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-foreground">{c.label}</td>
                      <td className="p-4 font-mono text-foreground">{c.usedCount} / {c.maxUses}</td>
                      <td className="p-4 text-muted-foreground font-mono">{new Date(c.expiresAt).toLocaleDateString()}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-[var(--radius-sm)] text-[10px] font-mono uppercase font-bold border ${
                          c.status === 'ACTIVE'
                            ? 'bg-success/10 text-success border-success/20'
                            : c.status === 'EXHAUSTED'
                            ? 'bg-warning/10 text-warning border-warning/20'
                            : 'bg-error/10 text-error border-error/20'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">{c.createdBy?.name || 'Admin'}</td>
                      <td className="p-4 text-right">
                        {c.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleRevoke(c._id)}
                            className="px-3 py-1.5 rounded-[var(--radius-sm)] bg-error/10 border border-error/20 text-error hover:bg-error/20 font-semibold"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Generate Code Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-6 max-w-md w-full text-foreground relative">
              <button onClick={() => setIsModalOpen(false)} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-bold text-lg mb-1">Generate Role Access Code</h3>
              <p className="text-xs text-muted-foreground mb-6">Create a cryptographically hashed verification code for Organizer or Judge signup.</p>

              <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-foreground mb-1.5">Target Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-2.5 bg-background border border-input rounded-[var(--radius-md)] text-xs text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="organizer">Organizer</option>
                    <option value="judge">Judge</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1.5">Label / Description</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Stanford Partner Organizer Code"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full px-4 py-2.5 bg-background border border-input rounded-[var(--radius-md)] text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-foreground mb-1.5">Expiration Date</label>
                    <input
                      type="date"
                      required
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      className="w-full px-3 py-2.5 bg-background border border-input rounded-[var(--radius-md)] text-xs text-foreground font-mono focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-foreground mb-1.5">Max Uses</label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={maxUses}
                      onChange={(e) => setMaxUses(e.target.value)}
                      className="w-full px-3 py-2.5 bg-background border border-input rounded-[var(--radius-md)] text-xs text-foreground font-mono focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-[var(--radius-md)] bg-surface-elevated border border-border text-foreground hover:bg-surface-hover font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-5 py-2.5 rounded-[var(--radius-md)] bg-primary hover:bg-primary-hover text-primary-foreground font-semibold shadow-lg shadow-primary/25 disabled:opacity-50"
                  >
                    {creating ? 'Generating...' : 'Generate Code'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* One-Time Reveal Modal */}
        {revealedCode && (
          <div className="fixed inset-0 bg-background/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-surface border-2 border-primary/40 rounded-[var(--radius-lg)] p-8 max-w-md w-full text-foreground text-center shadow-2xl shadow-primary/20 relative">
              <div className="w-12 h-12 rounded-[var(--radius-md)] bg-warning/10 border border-warning/20 text-warning flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <h3 className="font-extrabold text-xl mb-2">Access Code Generated!</h3>
              <p className="text-xs text-warning font-semibold mb-6">
                Copy this code now. For security, only the cryptographic hash is stored in MongoDB and this raw code will NEVER be shown again!
              </p>

              <div className="p-4 rounded-[var(--radius-md)] bg-background border border-border flex items-center justify-between font-mono text-lg font-extrabold text-primary mb-6">
                <span>{revealedCode}</span>
                <button
                  onClick={handleCopyCode}
                  className="p-2 rounded-[var(--radius-md)] bg-primary hover:bg-primary-hover text-primary-foreground transition-all flex items-center gap-1 text-xs font-sans font-semibold"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>

              <button
                onClick={() => setRevealedCode(null)}
                className="w-full py-3 rounded-[var(--radius-md)] bg-surface-elevated border border-border hover:bg-surface-hover text-foreground text-xs font-semibold"
              >
                I have securely saved this code
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAccessCodes;
