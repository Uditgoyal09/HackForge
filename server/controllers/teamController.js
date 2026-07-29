const crypto = require('crypto');
const Team = require('../models/Team');
const Hackathon = require('../models/Hackathon');
const Registration = require('../models/Registration');
const Invitation = require('../models/Invitation');
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');
const { createNotification } = require('../services/notificationService');
const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError } = require('../utils/ApiError');

// Helper to generate unique invite code
const generateInviteCode = () => crypto.randomBytes(4).toString('hex');

// @desc    Create a team
// @route   POST /api/hackathons/:id/teams
// @access  Private (Participant)
const createTeam = asyncHandler(async (req, res) => {
  const hackathonId = req.params.id;
  const participantId = req.user._id;
  const { name } = req.body;

  const hackathon = await Hackathon.findById(hackathonId);
  if (!hackathon) throw new ApiError(404, 'Hackathon not found');

  // Check if participant is registered for this hackathon
  const registration = await Registration.findOne({ hackathon: hackathonId, participant: participantId });
  if (!registration) throw new ApiError(403, 'You must register for the hackathon first');

  if (registration.status === 'rejected') throw new ApiError(403, 'Your registration was rejected');

  // Check if user is already in a team for this hackathon
  const existingTeam = await Team.findOne({ hackathon: hackathonId, members: participantId, status: 'active' });
  if (existingTeam) {
    throw new ApiError(409, 'You are already in a team for this hackathon');
  }

  const team = await Team.create({
    name,
    hackathon: hackathonId,
    leader: participantId,
    members: [participantId],
    inviteCode: generateInviteCode(),
  });

  // Link team to registration
  registration.team = team._id;
  await registration.save();

  // Auto-invite members listed during registration
  if (registration.teamMembers && registration.teamMembers.length > 0) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 3);
    
    const invitesToCreate = registration.teamMembers
      .filter(member => member.email)
      .map(member => ({
        team: team._id,
        hackathon: hackathonId,
        invitedBy: participantId,
        invitedEmail: member.email,
        expiresAt
      }));

    if (invitesToCreate.length > 0) {
      await Invitation.insertMany(invitesToCreate);
      
      // Log invitations and send notifications
      for (const invite of invitesToCreate) {
        await ActivityLog.create({
          user: participantId,
          action: 'team_invitation_sent',
          entityType: 'Team',
          entityId: team._id,
          metadata: { email: invite.invitedEmail, auto: true }
        });
        
        // Find the user by email to send notification
        const invitedUser = await User.findOne({ email: invite.invitedEmail });
        if (invitedUser) {
          // Find the exact invite created to get its ID
          const createdInvite = await Invitation.findOne({ 
            team: team._id, 
            invitedEmail: invite.invitedEmail,
            status: 'pending' 
          });
          
          if (createdInvite) {
            await createNotification({
              recipient: invitedUser._id,
              type: 'team_invitation',
              title: 'Team Invitation',
              message: `${req.user.name} invited you to join team ${team.name}.`,
              link: '/participant/teams',
              metadata: { eventKey: `team_inv:${createdInvite._id.toString()}` }
            });
          }
        }
      }
    }
  }

  await ActivityLog.create({
    user: participantId,
    action: 'team_created',
    entityType: 'Team',
    entityId: team._id,
  });

  res.status(201).json({
    success: true,
    data: team,
  });
});

// @desc    Get team details
// @route   GET /api/teams/:id
// @access  Private
const getTeam = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id)
    .populate('members', 'name email avatar')
    .populate('leader', 'name email avatar')
    .populate('hackathon', 'title maxTeamSize');

  if (!team) throw new ApiError(404, 'Team not found');

  const pendingInvitations = await Invitation.find({ team: team._id, status: 'pending' }, 'invitedEmail expiresAt');
  
  const teamData = team.toObject();
  teamData.pendingInvitations = pendingInvitations;

  res.status(200).json({ success: true, data: teamData });
});

// @desc    Leave team
// @route   POST /api/teams/:id/leave
// @access  Private (Participant)
const leaveTeam = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);
  if (!team) throw new ApiError(404, 'Team not found');

  const isMember = team.members.some(id => id.toString() === req.user._id.toString());
  if (!isMember) throw new ApiError(403, 'You are not a member of this team');

  if (team.leader.toString() === req.user._id.toString() && team.members.length > 1) {
    throw new ApiError(400, 'Leader cannot leave. Transfer leadership or disband the team.');
  }

  // Remove from team members
  team.members = team.members.filter(id => id.toString() !== req.user._id.toString());
  
  // If team is empty, disband it
  if (team.members.length === 0) {
    team.status = 'withdrawn'; // Soft delete
  }

  await team.save();

  // Clear team from registration
  await Registration.findOneAndUpdate(
    { hackathon: team.hackathon, participant: req.user._id },
    { $unset: { team: 1 } }
  );

  await ActivityLog.create({
    user: req.user._id,
    action: 'team_left',
    entityType: 'Team',
    entityId: team._id,
  });

  res.status(200).json({ success: true, message: 'Successfully left the team' });
});

// @desc    Join team via invite code
// @route   POST /api/teams/join/:inviteCode
// @access  Private (Participant)
const joinTeamByCode = asyncHandler(async (req, res) => {
  const { inviteCode } = req.params;
  const participantId = req.user._id;

  const team = await Team.findOne({ inviteCode, status: 'active' }).populate('hackathon');
  if (!team) throw new ApiError(404, 'Invalid or expired invite code');

  // Verify Registration
  const registration = await Registration.findOne({ hackathon: team.hackathon._id, participant: participantId });
  if (!registration) throw new ApiError(403, 'You must register for the hackathon first');
  if (registration.status === 'rejected') throw new ApiError(403, 'Your registration was rejected');

  // Check capacity
  if (team.members.length >= team.hackathon.maxTeamSize) {
    throw new ApiError(400, 'Team is already full');
  }

  // Check if already in another team
  const existingTeam = await Team.findOne({ hackathon: team.hackathon._id, members: participantId, status: 'active' });
  if (existingTeam) throw new ApiError(409, 'You are already in a team for this hackathon');

  // Add member
  team.members.push(participantId);
  await team.save();

  // Link registration
  registration.team = team._id;
  await registration.save();

  await ActivityLog.create({
    user: participantId,
    action: 'team_joined',
    entityType: 'Team',
    entityId: team._id,
  });

  res.status(200).json({ success: true, message: 'Successfully joined team', data: team });
});

// @desc    Remove member from team
// @route   DELETE /api/teams/:id/members/:userId
// @access  Private (Team Leader)
const removeMember = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);
  if (!team) throw new ApiError(404, 'Team not found');

  if (team.leader.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Only the team leader can remove members');
  }

  if (team.leader.toString() === req.params.userId) {
    throw new ApiError(400, 'Leader cannot remove themselves');
  }

  team.members = team.members.filter(id => id.toString() !== req.params.userId);
  await team.save();

  await Registration.findOneAndUpdate(
    { hackathon: team.hackathon, participant: req.params.userId },
    { $unset: { team: 1 } }
  );

  await ActivityLog.create({
    user: req.user._id,
    action: 'team_member_removed',
    entityType: 'Team',
    entityId: team._id,
  });

  res.status(200).json({ success: true, message: 'Member removed successfully' });
});

module.exports = {
  createTeam,
  getTeam,
  leaveTeam,
  joinTeamByCode,
  removeMember,
};
