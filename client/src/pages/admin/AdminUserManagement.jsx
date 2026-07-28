import React, { useState, useEffect } from 'react';
import { Search, Shield, Lock, Unlock, UserCheck, ArrowLeft } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { toast } from 'sonner';

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Role Change Modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('participant');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        search: search || undefined,
        role: roleFilter || undefined,
      };
      const res = await adminService.getUsers(params);
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch {
      toast.error('Failed to load users list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  const handleBlock = async (userId) => {
    if (!window.confirm('Are you sure you want to block this user? They will be immediately disconnected.')) return;

    try {
      await adminService.blockUser(userId);
      toast.success('User blocked');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to block user');
    }
  };

  const handleUnblock = async (userId) => {
    try {
      await adminService.unblockUser(userId);
      toast.success('User unblocked');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to unblock user');
    }
  };

  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    setActionLoading(true);
    try {
      await adminService.updateUserRole(selectedUser._id, newRole);
      toast.success(`Role updated to ${newRole}`);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user role');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight">User Moderation & RBAC</h1>
          <p className="text-slate-400 text-sm mt-1">Manage system user roles, block malicious accounts, and audit permissions.</p>
        </div>

        {/* Filters */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-4 sm:p-6 mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search user by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-slate-300"
          >
            <option value="">All Roles</option>
            <option value="participant">Participant</option>
            <option value="organizer">Organizer</option>
            <option value="judge">Judge</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-mono uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Account Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-900/40">
                      <td className="p-4 font-semibold text-white">{u.name}</td>
                      <td className="p-4 text-slate-400">{u.email}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-mono uppercase font-bold">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        {u.isBlocked ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-mono uppercase font-bold">
                            Blocked
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono uppercase font-bold">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setNewRole(u.role);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                          >
                            Change Role
                          </button>

                          {u.isBlocked ? (
                            <button
                              onClick={() => handleUnblock(u._id)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600/20 font-semibold"
                            >
                              Unblock
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBlock(u._id)}
                              className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 font-semibold"
                            >
                              Block
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Change Role Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-white">
              <h3 className="font-bold text-lg mb-1">Update User Role</h3>
              <p className="text-xs text-slate-400 mb-4">User: <span className="text-white font-semibold">{selectedUser.name}</span> ({selectedUser.email})</p>

              <form onSubmit={handleRoleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Target Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white"
                  >
                    <option value="participant">Participant</option>
                    <option value="organizer">Organizer</option>
                    <option value="judge">Judge</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-xs font-semibold text-white"
                  >
                    Confirm Role Update
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

export default AdminUserManagement;
