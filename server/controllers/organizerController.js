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

  const myHackathons = await Hackathon.find({ organizer: organizerId }).sort({ createdAt: -1 }).lean();
  const hackathonIds = myHackathons.map(h => h._id);

  if (hackathonIds.length === 0) {
    return res.status(200).json({
      success: true,
      data: {
        myHackathons: 0,
        hackathons: [],
        totalRegistrations: 0,
        pendingRegistrations: 0,
        activeTeams: 0,
        projectSubmissions: 0,
        assignedJudges: 0,
        publishedResults: 0,
        registrationTrend: [],
        recentActivity: [],
        upcomingDeadlines: [],
        needsAttention: []
      }
    });
  }

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

  // 1. Registration Trend (all time, grouped by YYYY-MM-DD)
  const registrationTrendRaw = await Registration.aggregate([
    { $match: { hackathon: { $in: hackathonIds } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  const registrationTrend = registrationTrendRaw.map(r => ({ date: r._id, count: r.count }));

  // 2. Recent Activity (Unified)
  const [recentRegs, recentTeams, recentSubs] = await Promise.all([
    Registration.find({ hackathon: { $in: hackathonIds } }).sort({ createdAt: -1 }).limit(5).populate('hackathon', 'title').lean(),
    Team.find({ hackathon: { $in: hackathonIds } }).sort({ createdAt: -1 }).limit(5).populate('hackathon', 'title').lean(),
    Submission.find({ hackathon: { $in: hackathonIds } }).sort({ createdAt: -1 }).limit(5).populate('hackathon', 'title').lean(),
  ]);

  const activity = [];
  recentRegs.forEach(r => {
    activity.push({
      id: r._id.toString(),
      type: 'registration',
      message: `${r.participantDetails?.name || 'A user'} registered for ${r.hackathon?.title || 'an event'}`,
      timestamp: r.createdAt
    });
  });
  recentTeams.forEach(t => {
    activity.push({
      id: t._id.toString(),
      type: 'team',
      message: `Team ${t.name} was formed in ${t.hackathon?.title || 'an event'}`,
      timestamp: t.createdAt
    });
  });
  recentSubs.forEach(s => {
    activity.push({
      id: s._id.toString(),
      type: 'submission',
      message: `Project ${s.title} was submitted in ${s.hackathon?.title || 'an event'}`,
      timestamp: s.createdAt
    });
  });

  // Sort unified activity descending and take top 8
  activity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const recentActivity = activity.slice(0, 8);

  // 3. Upcoming Deadlines
  const now = new Date();
  const deadlines = [];
  myHackathons.forEach(h => {
    if (h.registrationDeadline && new Date(h.registrationDeadline) > now) {
      deadlines.push({
        id: `reg-${h._id}`,
        type: 'Registration Closes',
        hackathon: h.title,
        date: h.registrationDeadline,
        urgency: (new Date(h.registrationDeadline) - now) < 86400000 * 3 ? 'high' : 'normal'
      });
    }
    if (h.submissionDeadline && new Date(h.submissionDeadline) > now) {
      deadlines.push({
        id: `sub-${h._id}`,
        type: 'Project Submission',
        hackathon: h.title,
        date: h.submissionDeadline,
        urgency: (new Date(h.submissionDeadline) - now) < 86400000 * 3 ? 'high' : 'normal'
      });
    }
    if (h.startDate && new Date(h.startDate) > now) {
      deadlines.push({
        id: `start-${h._id}`,
        type: 'Event Starts',
        hackathon: h.title,
        date: h.startDate,
        urgency: (new Date(h.startDate) - now) < 86400000 * 3 ? 'high' : 'normal'
      });
    }
  });
  deadlines.sort((a, b) => new Date(a.date) - new Date(b.date));
  const upcomingDeadlines = deadlines.slice(0, 5);

  // 4. Needs Attention
  const needsAttention = [];
  if (pendingRegistrations > 0) {
    needsAttention.push({
      id: 'pending-regs',
      type: 'applications',
      message: `${pendingRegistrations} applications awaiting review`,
      actionUrl: '/organizer' // Base dashboard
    });
  }

  res.status(200).json({
    success: true,
    data: {
      myHackathons: myHackathons.length,
      hackathons: myHackathons,
      totalRegistrations: registrations,
      pendingRegistrations,
      activeTeams: approvedTeams,
      projectSubmissions: submissions,
      assignedJudges,
      publishedResults: publishedResultsCount,
      registrationTrend,
      recentActivity,
      upcomingDeadlines,
      needsAttention
    }
  });
});

module.exports = {
  getOrganizerAnalytics,
};
