import React, { useState, useEffect } from 'react';
import { Users, Mail, UserPlus, LogOut, Trash2, Crown, Shield, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
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
        fetchTeamForHackathon(selectedHackathon);
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
    <div className="min-h-screen bg-background text-foreground pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <PageHeader 
          showBack 
          title="Team & Invitations"
          description="Form teams for approved hackathon registrations and manage member invites."
        />

        {/* Incoming Invitations Alert Section */}
        {myInvitations.length > 0 && (
          <div className="mb-10 bg-primary/10 border border-primary/20 rounded-[var(--radius-lg)] p-6">
            <h3 className="font-bold text-sm text-primary mb-4 flex items-center gap-2">
              <Mail className="w-4 h-4" /> Pending Invitations ({myInvitations.length})
            </h3>

            <div className="space-y-3">
              {myInvitations.map((inv) => (
                <div key={inv._id} className="p-4 rounded-[var(--radius-md)] bg-surface border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-foreground text-sm">{inv.team?.name}</span>
                    <p className="text-muted-foreground mt-0.5">
                      Hackathon: <span className="text-primary">{inv.hackathon?.title}</span> • Invited by {inv.invitedBy?.name}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAcceptInvite(inv._id)}
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-[var(--radius-md)] bg-success hover:bg-success/90 text-success-foreground font-semibold transition-all shadow-md shadow-success/20"
                    >
                      Accept & Join
                    </button>
                    <button
                      onClick={() => handleRejectInvite(inv._id)}
                      className="px-4 py-2 rounded-[var(--radius-md)] bg-surface border border-border text-error hover:bg-error/10 font-semibold transition-all"
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
            <label className="block text-xs font-semibold text-muted-foreground mb-2">Select Approved Hackathon</label>
            <select
              value={selectedHackathon}
              onChange={(e) => setSelectedHackathon(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-input rounded-[var(--radius-md)] text-sm text-foreground focus:outline-none focus:border-primary"
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
          <div className="h-64 rounded-[var(--radius-lg)] bg-surface border border-border animate-pulse shadow-sm" />
        ) : !selectedHackathon ? (
          <div className="flex flex-col items-center justify-center py-20 bg-surface/50 border border-border border-dashed rounded-[var(--radius-xl)] text-center max-w-3xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-surface-elevated border border-border flex items-center justify-center mb-6">
              <Shield className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-bold text-xl text-foreground mb-2">No Approved Registrations</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
              You must have an approved registration for a hackathon before creating or joining a team.
            </p>
          </div>
        ) : myTeam ? (
          /* Active Team Details View */
          <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-6 sm:p-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-extrabold text-foreground">{myTeam.name}</h2>
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-mono">
                    {myTeam.members?.length} Members
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Leader: {myTeam.leader?.name}</p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to="/participant/submissions"
                  className="px-4 py-2 rounded-[var(--radius-md)] bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-semibold transition-all flex items-center gap-1.5 shadow-lg shadow-primary/25"
                >
                  Submit Project <ArrowRight className="w-4 h-4" />
                </Link>
                {!isLeader && (
                  <button
                    onClick={handleLeaveTeam}
                    className="px-4 py-2 rounded-[var(--radius-md)] bg-error/10 border border-error/20 text-error hover:bg-error/20 text-xs font-semibold transition-all flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <LogOut className="w-4 h-4" /> Leave Team
                  </button>
                )}
              </div>
            </div>

            {/* Members List */}
            <div>
              <h3 className="font-bold text-sm text-foreground mb-4 uppercase tracking-wider font-mono">Team Members</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {myTeam.members?.map((m) => {
                  const isMemberLeader = myTeam.leader?._id === m._id;
                  return (
                    <div key={m._id} className="p-4 rounded-[var(--radius-md)] bg-background border border-border flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-primary">
                          {m.name?.substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground flex items-center gap-1.5">
                            {m.name} {isMemberLeader && <Crown className="w-3.5 h-3.5 text-warning" />}
                          </p>
                          <p className="text-muted-foreground text-[11px]">{m.email}</p>
                        </div>
                      </div>

                      {isLeader && !isMemberLeader && (
                        <button
                          onClick={() => handleRemoveMember(m._id)}
                          className="p-2 text-muted-foreground hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                          title="Remove Member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
                
                {/* Pending Invitations */}
                {myTeam.pendingInvitations?.map((inv) => (
                  <div key={inv._id} className="p-4 rounded-[var(--radius-md)] bg-background/50 border border-border border-dashed flex items-center justify-between text-xs opacity-75">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-surface-elevated border border-border flex items-center justify-center font-bold text-muted-foreground uppercase">
                        {inv.invitedEmail.substring(0, 2)}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground flex items-center gap-1.5">
                          Pending Invite <span className="px-1.5 py-0.5 rounded bg-warning/10 text-warning text-[9px] uppercase tracking-wider font-bold">Sent</span>
                        </p>
                        <p className="text-muted-foreground text-[11px]">{inv.invitedEmail}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Invite Teammates (Leader Only) */}
            {isLeader && (
              <div className="pt-6 border-t border-border">
                <h3 className="font-bold text-sm text-foreground mb-3 uppercase tracking-wider font-mono">
                  Invite Member by Email
                </h3>

                <form onSubmit={handleSendInvite} className="flex gap-3 max-w-md">
                  <input
                    type="email"
                    required
                    placeholder="teammate@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-background border border-input rounded-[var(--radius-md)] text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                  />
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2.5 rounded-[var(--radius-md)] bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs transition-all shadow-lg shadow-primary/25 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <UserPlus className="w-4 h-4" /> Send Invite
                  </button>
                </form>
              </div>
            )}
          </div>
        ) : (
          /* Create Team View */
          <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-8 max-w-md">
            <h2 className="text-xl font-extrabold text-foreground mb-2">Create a New Team</h2>
            <p className="text-xs text-muted-foreground mb-6">You are not in a team for this hackathon yet. Create a team as leader.</p>

            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Team Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Crypto Coders"
                  value={createTeamName}
                  onChange={(e) => setCreateTeamName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-input rounded-[var(--radius-md)] text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-3 rounded-[var(--radius-md)] bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-sm transition-all shadow-lg shadow-primary/25 disabled:opacity-50"
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
