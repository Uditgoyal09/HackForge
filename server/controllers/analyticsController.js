const User = require('../models/User');
const Hackathon = require('../models/Hackathon');
const Team = require('../models/Team');
const Submission = require('../models/Submission');
const Review = require('../models/Review');
const { asyncHandler } = require('../utils/asyncHandler');

// @desc    Get platform analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
const getPlatformAnalytics = asyncHandler(async (req, res) => {
  // Using MongoDB aggregation to get exact stats without loading large datasets in memory
  const [
    totalUsers,
    roleDistribution,
    totalHackathons,
    hackathonStatusDistribution,
    totalTeams,
    totalSubmissions,
    totalReviews
  ] = await Promise.all([
    User.countDocuments(),
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    Hackathon.countDocuments(),
    Hackathon.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Team.countDocuments(),
    Submission.countDocuments(),
    Review.countDocuments(),
  ]);

  const stats = {
    totalUsers,
    totalParticipants: roleDistribution.find(r => r._id === 'participant')?.count || 0,
    totalOrganizers: roleDistribution.find(r => r._id === 'organizer')?.count || 0,
    totalJudges: roleDistribution.find(r => r._id === 'judge')?.count || 0,
    totalHackathons,
    activeHackathons: hackathonStatusDistribution.find(h => h._id === 'ongoing')?.count || 0,
    totalTeams,
    totalSubmissions,
    totalReviews,
    roleDistribution,
    hackathonStatusDistribution,
  };

  res.status(200).json({ success: true, data: stats });
});

module.exports = {
  getPlatformAnalytics,
};
