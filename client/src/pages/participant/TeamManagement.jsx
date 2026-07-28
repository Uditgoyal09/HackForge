import React, { useState, useEffect } from 'react';
import { Users, Mail, UserPlus, LogOut, Trash2, Crown, Shield, CheckCircle2, XCircle } from 'lucide-react';
import { teamService } from '../../services/teamService';
import { invitationService } from '../../services/invitationService';
import { registrationService } from '../../services/registrationService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const TeamManagement = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [selectedHackathon, setSelectedHackathon] = useState('');
  const [myTeam, setMyTeam] = useState(null);
  const [myInvitations, setMyInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [createTeamName, setCreateTeamName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [regRes, invRes] = await Promise.all([
        registrationService.getMyRegistrations(),
        invitationService.getMyInvitations(),
      ]);

      if (regRes.success && regRes.data) {
        const approved = regRes.data.filter(r => r.status === 'approved');
        setRegistrations(approved);
        if (approved.length > 0) {
          setSelectedHackathon(approved[0].hackathon?._id || approved[0].hackathon);
        }
      }

      if (invRes.success && invRes.data) {
        setMyInvitations(invRes.data);
      }
    } catch {
      toast.error('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamForHackathon = async (hackathonId) => {
    if (!hackathonId) {
      setMyTeam(null);
      return;
    }
    try {
      const reg = registrations.find(r => (r.hackathon?._id || r.hackathon) === hackathonId);
      if (reg && reg.team) {
        const teamId = typeof reg.team === 'object' ? reg.team._id : reg.team;
        const res = await teamService.getTeamDetails(teamId);
        if (res.success && res.data) {
          setMyTeam(res.data);
          return;
        }
      }
      setMyTeam(null);
    } catch {
      setMyTeam(null);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedHackathon) {
      fetchTeamForHackathon(selectedHackathon);
    }
  }, [selectedHackathon, registrations]);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!createTeamName || !selectedHackathon) return;

    setActionLoading(true);
    try {
      const res = await teamService.createTeam(selectedHackathon, { name: createTeamName });
      if (res.success) {
        toast.success('Team created successfully!');
        setCreateTeamName('');
        fetchInitialData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create team');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail || !myTeam) return;

    setActionLoading(true);
    try {
      const res = await invitationService.sendInvitation(myTeam._id, inviteEmail);
      if (res.success) {
        toast.success(`Invitation sent to ${inviteEmail}`);
        setInviteEmail('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send invitation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptInvite = async (inviteId) => {
    setActionLoading(true);
    try {
      const res = await invitationService.acceptInvitation(inviteId);
      if (res.success) {
        toast.success('Joined team successfully!');
        fetchInitialData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept invitation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectInvite = async (inviteId) => {
    try {
      await invitationService.rejectInvitation(inviteId);
      toast.success('Invitation rejected');
      setMyInvitations(prev => prev.filter(i => i._id !== inviteId));
    } catch {
      toast.error('Failed to reject invitation');
    }
  };

  const handleLeaveTeam = async () => {
    if (!myTeam || !window.confirm('Are you sure you want to leave this team?')) return;

    try {
      await teamService.leaveTeam(myTeam._id);
      toast.success('Left team successfully');
      fetchInitialData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to leave team');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!myTeam || !window.confirm('Remove this member from the team?')) return;

    try {
      await teamService.removeMember(myTeam._id, memberId);
      toast.success('Member removed');
      fetchTeamForHackathon(selectedHackathon);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const isLeader = myTeam && myTeam.leader?._id === user?._id;

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight">Team & Invitations</h1>
          <p className="text-slate-400 text-sm mt-1">Form teams for approved hackathon registrations and manage member invites.</p>
        </div>

        {/* Incoming Invitations Alert Section */}
        {myInvitations.length > 0 && (
          <div className="mb-10 bg-indigo-950/40 border border-indigo-500/30 rounded-3xl p-6">
            <h3 className="font-bold text-sm text-indigo-300 mb-4 flex items-center gap-2">
              <Mail className="w-4 h-4" /> Pending Invitations ({myInvitations.length})
            </h3>

            <div className="space-y-3">
              {myInvitations.map((inv) => (
                <div key={inv._id} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-white text-sm">{inv.team?.name}</span>
                    <p className="text-slate-400 mt-0.5">
                      Hackathon: <span className="text-indigo-400">{inv.hackathon?.title}</span> • Invited by {inv.invitedBy?.name}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAcceptInvite(inv._id)}
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all shadow-md shadow-emerald-600/20"
                    >
                      Accept & Join
                    </button>
                    <button
                      onClick={() => handleRejectInvite(inv._id)}
                      className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-rose-400 hover:bg-rose-500/10 font-semibold transition-all"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hackathon Selector */}
        {registrations.length > 0 && (
          <div className="mb-8 max-w-xs">
            <label className="block text-xs font-semibold text-slate-400 mb-2">Select Approved Hackathon</label>
            <select
              value={selectedHackathon}
              onChange={(e) => setSelectedHackathon(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              {registrations.map(r => (
                <option key={r._id} value={r.hackathon?._id || r.hackathon}>
                  {r.hackathon?.title || 'Approved Event'}
                </option>
              ))}
            </select>
          </div>
        )}

        {loading ? (
          <div className="h-64 rounded-3xl bg-slate-900/60 border border-slate-800/80 animate-pulse" />
        ) : !selectedHackathon ? (
          <div className="text-center py-20 bg-slate-900/30 border border-slate-800/50 rounded-3xl p-8 max-w-md mx-auto">
            <Shield className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="font-bold text-lg text-slate-300">No Approved Registrations</h3>
            <p className="text-xs text-slate-500 mt-1">
              You must have an approved registration for a hackathon before creating or joining a team.
            </p>
          </div>
        ) : myTeam ? (
          /* Active Team Details View */
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 sm:p-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/60">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-extrabold text-white">{myTeam.name}</h2>
                  <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-mono">
                    {myTeam.members?.length} Members
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Leader: {myTeam.leader?.name}</p>
              </div>

              {!isLeader && (
                <button
                  onClick={handleLeaveTeam}
                  className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold transition-all flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <LogOut className="w-4 h-4" /> Leave Team
                </button>
              )}
            </div>

            {/* Members List */}
            <div>
              <h3 className="font-bold text-sm text-slate-300 mb-4 uppercase tracking-wider font-mono">Team Members</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {myTeam.members?.map((m) => {
                  const isMemberLeader = myTeam.leader?._id === m._id;
                  return (
                    <div key={m._id} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-300">
                          {m.name?.substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-white flex items-center gap-1.5">
                            {m.name} {isMemberLeader && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                          </p>
                          <p className="text-slate-400 text-[11px]">{m.email}</p>
                        </div>
                      </div>

                      {isLeader && !isMemberLeader && (
                        <button
                          onClick={() => handleRemoveMember(m._id)}
                          className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Remove Member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Invite Teammates (Leader Only) */}
            {isLeader && (
              <div className="pt-6 border-t border-slate-800/60">
                <h3 className="font-bold text-sm text-slate-300 mb-3 uppercase tracking-wider font-mono">
                  Invite Member by Email
                </h3>

                <form onSubmit={handleSendInvite} className="flex gap-3 max-w-md">
                  <input
                    type="email"
                    required
                    placeholder="teammate@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/25 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <UserPlus className="w-4 h-4" /> Send Invite
                  </button>
                </form>
              </div>
            )}
          </div>
        ) : (
          /* Create Team View */
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-8 max-w-md">
            <h2 className="text-xl font-extrabold text-white mb-2">Create a New Team</h2>
            <p className="text-xs text-slate-400 mb-6">You are not in a team for this hackathon yet. Create a team as leader.</p>

            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Team Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Crypto Coders"
                  value={createTeamName}
                  onChange={(e) => setCreateTeamName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/25 disabled:opacity-50"
              >
                {actionLoading ? 'Creating...' : 'Create Team'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamManagement;
