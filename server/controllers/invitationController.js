const mongoose = require('mongoose');
const Invitation = require('../models/Invitation');
const Team = require('../models/Team');
const Registration = require('../models/Registration');
const ActivityLog = require('../models/ActivityLog');
const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError } = require('../utils/ApiError');

// @desc    Invite member to team
// @route   POST /api/teams/:id/invitations
// @access  Private (Participant/Leader)
const inviteMember = asyncHandler(async (req, res) => {
  const teamId = req.params.id;
  const invitedEmail = req.body.invitedEmail || req.body.email;
  const inviterId = req.user._id;

  const team = await Team.findById(teamId).populate('hackathon');
  if (!team) throw new ApiError(404, 'Team not found');

  if (team.leader.toString() !== inviterId.toString()) {
    throw new ApiError(403, 'Only team leader can invite members');
  }

  if (team.members.length >= team.hackathon.maxTeamSize) {
    throw new ApiError(400, 'Team capacity reached');
  }

  // Check if invitation already pending
  const existingInvite = await Invitation.findOne({ team: teamId, invitedEmail, status: 'pending' });
  if (existingInvite) {
    throw new ApiError(409, 'Invitation already sent to this email');
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 3); // 3 days expiry

  const invitation = await Invitation.create({
    team: teamId,
    hackathon: team.hackathon._id,
    invitedBy: inviterId,
    invitedEmail,
    expiresAt,
  });

  await ActivityLog.create({
    user: inviterId,
    action: 'team_invitation_sent',
    entityType: 'Invitation',
    entityId: invitation._id,
    metadata: { email: invitedEmail }
  });

  res.status(201).json({ success: true, message: 'Invitation sent', data: invitation });
});

// @desc    Get my invitations
// @route   GET /api/invitations/me
// @access  Private (Participant)
const getMyInvitations = asyncHandler(async (req, res) => {
  const email = req.user.email;
  const invitations = await Invitation.find({ invitedEmail: email, status: 'pending' })
    .populate('team', 'name')
    .populate('hackathon', 'title maxTeamSize')
    .populate('invitedBy', 'name');

  res.status(200).json({ success: true, data: invitations });
});

// @desc    Accept invitation
// @route   PATCH /api/invitations/:id/accept
// @access  Private (Participant)
const acceptInvitation = asyncHandler(async (req, res) => {
  const inviteId = req.params.id;
  const participantId = req.user._id;

  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
  } catch {
    session = null;
  }

  const runOperation = async (opts) => {
    const invitation = await Invitation.findById(inviteId, null, opts);
    if (!invitation) throw new ApiError(404, 'Invitation not found');
    
    if (invitation.invitedEmail !== req.user.email) {
      throw new ApiError(403, 'This invitation is not for you');
    }

    if (invitation.status !== 'pending' || new Date() > invitation.expiresAt) {
      invitation.status = 'expired';
      await invitation.save(opts);
      throw new ApiError(400, 'Invitation is expired or already processed');
    }

    const team = await Team.findById(invitation.team, null, opts).populate('hackathon');
    if (!team) throw new ApiError(404, 'Team no longer exists');

    if (team.members.length >= team.hackathon.maxTeamSize) {
      throw new ApiError(400, 'Team is already full');
    }

    const registration = await Registration.findOne({ hackathon: team.hackathon._id, participant: participantId }, null, opts);
    if (!registration) throw new ApiError(403, 'You must register for the hackathon first');
    if (registration.status === 'rejected') throw new ApiError(403, 'Your registration was rejected');

    const existingTeam = await Team.findOne({ hackathon: team.hackathon._id, members: participantId, status: 'active' }, null, opts);
    if (existingTeam) throw new ApiError(409, 'You are already in a team for this hackathon');

    team.members.push(participantId);
    await team.save(opts);

    registration.team = team._id;
    await registration.save(opts);

    invitation.status = 'accepted';
    invitation.invitedUser = participantId;
    await invitation.save(opts);

    await ActivityLog.create({
      user: participantId,
      action: 'invitation_accepted',
      entityType: 'Team',
      entityId: team._id,
    });
  };

  try {
    if (session) {
      try {
        await runOperation({ session });
        await session.commitTransaction();
        return res.status(200).json({ success: true, message: 'Invitation accepted and joined team' });
      } catch (err) {
        if (session.inTransaction()) {
          await session.abortTransaction();
        }
        if (err.message && err.message.includes('replica set')) {
          await runOperation({});
          return res.status(200).json({ success: true, message: 'Invitation accepted and joined team' });
        }
        throw err;
      }
    } else {
      await runOperation({});
      return res.status(200).json({ success: true, message: 'Invitation accepted and joined team' });
    }
  } finally {
    if (session) {
      session.endSession();
    }
  }
});

// @desc    Reject invitation
// @route   PATCH /api/invitations/:id/reject
// @access  Private (Participant)
const rejectInvitation = asyncHandler(async (req, res) => {
  const invitation = await Invitation.findById(req.params.id);
  if (!invitation) throw new ApiError(404, 'Invitation not found');

  if (invitation.invitedEmail !== req.user.email) {
    throw new ApiError(403, 'This invitation is not for you');
  }

  invitation.status = 'rejected';
  invitation.invitedUser = req.user._id;
  await invitation.save();

  res.status(200).json({ success: true, message: 'Invitation rejected' });
});

module.exports = {
  inviteMember,
  getMyInvitations,
  acceptInvitation,
  rejectInvitation
};
