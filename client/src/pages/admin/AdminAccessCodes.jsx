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
    <div className="min-h-screen bg-slate-950 text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-mono uppercase font-bold text-rose-400 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 mb-3 inline-block">
              Security Control
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight">Role Verification Access Codes</h1>
            <p className="text-slate-400 text-sm mt-1">Generate and manage cryptographically hashed verification codes for Organizers and Judges.</p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Generate Access Code
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : codes.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/30 border border-slate-800/50 rounded-3xl p-8">
            <Key className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="font-bold text-slate-300">No Access Codes Generated</h3>
            <p className="text-xs text-slate-500 mt-1">Click above to generate verification codes for Organizers or Judges.</p>
          </div>
        ) : (
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-mono uppercase border-b border-slate-800">
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
                <tbody className="divide-y divide-slate-800/60">
                  {codes.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-900/40">
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold border ${
                          c.role === 'organizer'
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                            : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                        }`}>
                          {c.role}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-white">{c.label}</td>
                      <td className="p-4 font-mono text-slate-300">{c.usedCount} / {c.maxUses}</td>
                      <td className="p-4 text-slate-400 font-mono">{new Date(c.expiresAt).toLocaleDateString()}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold border ${
                          c.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : c.status === 'EXHAUSTED'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400">{c.createdBy?.name || 'Admin'}</td>
                      <td className="p-4 text-right">
                        {c.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleRevoke(c._id)}
                            className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 font-semibold"
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
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-white relative">
              <button onClick={() => setIsModalOpen(false)} className="absolute right-4 top-4 text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-bold text-lg mb-1">Generate Role Access Code</h3>
              <p className="text-xs text-slate-400 mb-6">Create a cryptographically hashed verification code for Organizer or Judge signup.</p>

              <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">Target Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    <option value="organizer">Organizer</option>
                    <option value="judge">Judge</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">Label / Description</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Stanford Partner Organizer Code"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1.5">Expiration Date</label>
                    <input
                      type="date"
                      required
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1.5">Max Uses</label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={maxUses}
                      onChange={(e) => setMaxUses(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/25"
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
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border-2 border-indigo-500/40 rounded-3xl p-8 max-w-md w-full text-white text-center shadow-2xl shadow-indigo-500/20 relative">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <h3 className="font-extrabold text-xl mb-2">Access Code Generated!</h3>
              <p className="text-xs text-amber-300 font-semibold mb-6">
                Copy this code now. For security, only the cryptographic hash is stored in MongoDB and this raw code will NEVER be shown again!
              </p>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between font-mono text-lg font-extrabold text-indigo-400 mb-6">
                <span>{revealedCode}</span>
                <button
                  onClick={handleCopyCode}
                  className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center gap-1 text-xs font-sans font-semibold"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>

              <button
                onClick={() => setRevealedCode(null)}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
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
