const express = require('express');
const { getJudgeAssignments } = require('../controllers/judgeController');
const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const { asyncHandler } = require('../utils/asyncHandler');
const Review = require('../models/Review');

const router = express.Router();

// @desc    Get judge dashboard stats
// @route   GET /api/judge/dashboard
// @access  Private (Judge)
const getJudgeDashboard = asyncHandler(async (req, res) => {
  const judgeId = req.user._id;

  // Since getJudgeAssignments returns all assignments, we can calculate stats here or use aggregation
  // For simplicity, we just aggregate the Review collection for this judge
  
  const reviews = await Review.find({ judge: judgeId }).lean();
  
  const pendingReviewsCount = reviews.filter(r => r.status === 'draft').length;
  const completedReviewsCount = reviews.filter(r => r.status === 'submitted').length;

  res.status(200).json({
    success: true,
    data: {
      pendingReviews: pendingReviewsCount,
      completedReviews: completedReviewsCount,
      totalAssigned: reviews.length, // Rough estimate, actually requires JudgeAssignment count
    }
  });
});

router.get('/dashboard', protect, authorize('judge'), getJudgeDashboard);
router.get('/assignments', protect, authorize('judge'), getJudgeAssignments);

module.exports = router;
