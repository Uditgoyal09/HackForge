const Hackathon = require('../models/Hackathon');
const Registration = require('../models/Registration');
const Team = require('../models/Team');
const Submission = require('../models/Submission');
const { asyncHandler } = require('../utils/asyncHandler');

// @desc    Get participant dashboard stats
// @route   GET /api/participant/dashboard
// @access  Private (Participant)
const getParticipantDashboard = asyncHandler(async (req, res) => {
  const participantId = req.user._id;

  const registrations = await Registration.find({ participant: participantId })
    .populate('hackathon', 'title status startDate endDate')
    .lean();

  const registeredHackathonIds = registrations.map(r => r.hackathon._id);

  const currentTeams = await Team.find({ members: participantId, status: 'active' })
    .populate('hackathon', 'title submissionDeadline')
    .lean();

  const submissionStatuses = await Submission.find({ team: { $in: currentTeams.map(t => t._id) } })
    .select('hackathon team status projectName submittedAt')
    .lean();

  // Basic upcoming deadlines
  const upcomingDeadlines = currentTeams
    .map(team => ({
      hackathon: team.hackathon.title,
      deadline: team.hackathon.submissionDeadline
    }))
    .filter(t => new Date(t.deadline) > new Date());

  res.status(200).json({
    success: true,
    data: {
      registrations,
      myRegistrations: registrations,
      registeredHackathonIds: (registrations || []).map(r => r.hackathon?._id).filter(Boolean),
      currentTeams,
      myTeams: currentTeams,
      submissionStatuses,
      mySubmissions: submissionStatuses,
      upcomingDeadlines,
    }
  });
});

module.exports = { getParticipantDashboard };
