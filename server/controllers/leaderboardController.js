const mongoose = require('mongoose');
const Hackathon = require('../models/Hackathon');
const Submission = require('../models/Submission');
const Review = require('../models/Review');
const ActivityLog = require('../models/ActivityLog');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');

// @desc    Calculate and get leaderboard
// @route   GET /api/hackathons/:id/leaderboard
// @access  Public (if published) or Private (Organizer/Admin preview)
const getLeaderboard = asyncHandler(async (req, res) => {
  const hackathonId = req.params.id;
  const hackathon = await Hackathon.findById(hackathonId);
  if (!hackathon) throw new ApiError(404, 'Hackathon not found');

  const isOrganizer = req.user && req.user.role === 'organizer' && hackathon.organizer.toString() === req.user._id.toString();
  const isAdmin = req.user && req.user.role === 'admin';

  if (!hackathon.resultsPublished && !isOrganizer && !isAdmin) {
    throw new ApiError(403, 'Results are not published yet');
  }

  // Fetch all submissions for this hackathon
  const submissions = await Submission.find({ hackathon: hackathonId, status: { $in: ['pending', 'approved', 'under_review'] } })
    .populate('team', 'name leader')
    .lean();

  const leaderboard = [];

  for (const submission of submissions) {
    // Fetch submitted reviews
    const reviews = await Review.find({ submission: submission._id, status: 'submitted' }).lean();

    if (reviews.length === 0) continue; // Skip if no reviews

    // Calculate sum of totalScores
    const sumTotalScore = reviews.reduce((acc, review) => acc + review.totalScore, 0);
    const averageScore = sumTotalScore / reviews.length;

    // Calculate tie-breaker criteria
    let sumInnovation = 0;
    let sumTech = 0;

    reviews.forEach(review => {
      const inn = review.criteriaScores.find(c => c.criterionName.toLowerCase().includes('innovation'));
      const tech = review.criteriaScores.find(c => c.criterionName.toLowerCase().includes('technical'));
      if (inn) sumInnovation += inn.score;
      if (tech) sumTech += tech.score;
    });

    leaderboard.push({
      submissionId: submission._id,
      team: submission.team,
      projectName: submission.projectName,
      averageScore,
      tieBreakers: {
        innovation: reviews.length ? sumInnovation / reviews.length : 0,
        technical: reviews.length ? sumTech / reviews.length : 0,
        submittedAt: submission.submittedAt,
      },
      numberOfReviews: reviews.length,
    });
  }

  // Deterministic tie-breaking
  leaderboard.sort((a, b) => {
    if (b.averageScore !== a.averageScore) return b.averageScore - a.averageScore;
    if (b.tieBreakers.innovation !== a.tieBreakers.innovation) return b.tieBreakers.innovation - a.tieBreakers.innovation;
    if (b.tieBreakers.technical !== a.tieBreakers.technical) return b.tieBreakers.technical - a.tieBreakers.technical;
    return new Date(a.tieBreakers.submittedAt) - new Date(b.tieBreakers.submittedAt);
  });

  // Assign ranks
  leaderboard.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  res.status(200).json({ success: true, data: leaderboard, resultsPublished: hackathon.resultsPublished });
});

// @desc    Publish results
// @route   PATCH /api/hackathons/:id/publish-results
// @access  Private (Organizer owner or Admin)
const publishResults = asyncHandler(async (req, res) => {
  const hackathonId = req.params.id;

  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
  } catch {
    session = null;
  }

  const runOperation = async (opts) => {
    const hackathon = await Hackathon.findById(hackathonId, null, opts);
    if (!hackathon) throw new ApiError(404, 'Hackathon not found');

    if (req.user.role !== 'admin' && hackathon.organizer.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Unauthorized');
    }

    if (hackathon.resultsPublished) {
      throw new ApiError(400, 'Results are already published');
    }

    const submissionsCount = await Submission.countDocuments({ hackathon: hackathonId }, opts);
    if (submissionsCount === 0) {
      throw new ApiError(400, 'Cannot publish results without submissions');
    }

    const subIds = await Submission.distinct('_id', { hackathon: hackathonId });
    const reviewsCount = await Review.countDocuments({ 
      submission: { $in: subIds },
      status: 'submitted' 
    }, opts);

    if (reviewsCount === 0) {
      throw new ApiError(400, 'Cannot publish results without submitted reviews');
    }

    hackathon.resultsPublished = true;
    hackathon.publishedAt = new Date();
    hackathon.status = 'completed'; 
    await hackathon.save(opts);

    await ActivityLog.create({
      user: req.user._id,
      action: 'results_published',
      entityType: 'Hackathon',
      entityId: hackathon._id,
    });
  };

  try {
    if (session) {
      try {
        await runOperation({ session });
        await session.commitTransaction();
        return res.status(200).json({ success: true, message: 'Results published successfully' });
      } catch (err) {
        if (session.inTransaction()) {
          await session.abortTransaction();
        }
        if (err.message && err.message.includes('replica set')) {
          await runOperation({});
          return res.status(200).json({ success: true, message: 'Results published successfully' });
        }
        throw err;
      }
    } else {
      await runOperation({});
      return res.status(200).json({ success: true, message: 'Results published successfully' });
    }
  } finally {
    if (session) {
      session.endSession();
    }
  }
});

module.exports = {
  getLeaderboard,
  publishResults,
};
