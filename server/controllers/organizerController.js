const Hackathon = require('../models/Hackathon');
const Registration = require('../models/Registration');
const Team = require('../models/Team');
const Submission = require('../models/Submission');
const JudgeAssignment = require('../models/JudgeAssignment');
const { asyncHandler } = require('../utils/asyncHandler');

// @desc    Get organizer analytics
// @route   GET /api/organizer/analytics
// @access  Private (Organizer)
const getOrganizerAnalytics = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;

  const myHackathons = await Hackathon.find({ organizer: organizerId }).lean();
  const hackathonIds = myHackathons.map(h => h._id);

  const [
    registrations,
    approvedTeams,
    submissions,
    assignedJudges
  ] = await Promise.all([
    Registration.countDocuments({ hackathon: { $in: hackathonIds } }),
    Team.countDocuments({ hackathon: { $in: hackathonIds }, status: 'active' }),
    Submission.countDocuments({ hackathon: { $in: hackathonIds } }),
    JudgeAssignment.countDocuments({ hackathon: { $in: hackathonIds } }),
  ]);

  const pendingRegistrations = await Registration.countDocuments({ hackathon: { $in: hackathonIds }, status: 'pending' });
  const publishedResultsCount = myHackathons.filter(h => h.resultsPublished).length;

  res.status(200).json({
    success: true,
    data: {
      myHackathons: myHackathons.length,
      registrations,
      pendingRegistrations,
      approvedTeams,
      submissions,
      assignedJudges,
      publishedResults: publishedResultsCount,
    }
  });
});

module.exports = {
  getOrganizerAnalytics,
};
