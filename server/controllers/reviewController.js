const Review = require('../models/Review');
const Submission = require('../models/Submission');
const JudgeAssignment = require('../models/JudgeAssignment');
const ActivityLog = require('../models/ActivityLog');
const { createNotification } = require('../services/notificationService');
const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError } = require('../utils/ApiError');

// @desc    Submit a review for a submission
// @route   POST /api/submissions/:id/reviews
// @access  Private (Judge)
const createReview = asyncHandler(async (req, res) => {
  const submissionId = req.params.id;
  const judgeId = req.user._id;
  const { criteriaScores, feedback, status } = req.body;

  // 1. Verify judge assignment
  const assignment = await JudgeAssignment.findOne({ submission: submissionId, judge: judgeId })
    .populate({
      path: 'hackathon',
      select: 'judgingCriteria resultsPublished organizer title'
    });

  if (!assignment) {
    throw new ApiError(403, 'You are not assigned to review this submission');
  }

  if (assignment.hackathon.resultsPublished) {
    throw new ApiError(403, 'Results are already published, cannot submit new reviews');
  }

  // 2. Prevent duplicate review
  const existingReview = await Review.findOne({ submission: submissionId, judge: judgeId });
  if (existingReview) {
    throw new ApiError(409, 'You have already submitted a review for this project');
  }

  // 3. Server-side score validation and calculation
  const hackathonCriteria = assignment.hackathon.judgingCriteria;
  let calculatedTotalScore = 0;
  const processedCriteriaScores = [];

  for (const inputScore of criteriaScores) {
    const matchedCriterion = hackathonCriteria.find(c => c.name === inputScore.criterionName);
    
    if (!matchedCriterion) {
      throw new ApiError(400, `Unknown criterion: ${inputScore.criterionName}`);
    }

    if (inputScore.score > matchedCriterion.maxScore) {
      throw new ApiError(400, `Score for ${matchedCriterion.name} cannot exceed maxScore of ${matchedCriterion.maxScore}`);
    }

    calculatedTotalScore += inputScore.score;
    processedCriteriaScores.push({
      criterionName: matchedCriterion.name,
      score: inputScore.score,
      maxScore: matchedCriterion.maxScore,
    });
  }

  // Ensure all criteria are evaluated
  if (processedCriteriaScores.length !== hackathonCriteria.length) {
    throw new ApiError(400, 'All judging criteria must be evaluated');
  }

  // 4. Create review
  const review = await Review.create({
    submission: submissionId,
    judge: judgeId,
    criteriaScores: processedCriteriaScores,
    totalScore: calculatedTotalScore,
    feedback,
    status: status || 'draft',
    submittedAt: status === 'submitted' ? new Date() : undefined,
  });

  if (status === 'submitted') {
    assignment.status = 'reviewed';
    await assignment.save();

    await ActivityLog.create({
      user: judgeId,
      action: 'review_submitted',
      entityType: 'Review',
      entityId: review._id,
    });

    await createNotification({
      recipient: assignment.hackathon.organizer,
      type: 'evaluation_completed',
      title: 'Evaluation Completed',
      message: `A judge has submitted an evaluation for a project in ${assignment.hackathon.title}.`,
      link: `/organizer/hackathons/${assignment.hackathon._id}/submissions`,
      metadata: { eventKey: `eval_comp:${review._id.toString()}` }
    });
  }

  res.status(201).json({ success: true, data: review });
});

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private (Judge)
const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id)
    .populate({
      path: 'submission',
      populate: { path: 'hackathon', select: 'judgingCriteria resultsPublished organizer title' }
    });

  if (!review) throw new ApiError(404, 'Review not found');

  if (review.judge.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You can only update your own reviews');
  }

  if (review.submission.hackathon.resultsPublished) {
    throw new ApiError(403, 'Results are already published, cannot update reviews');
  }

  // If already submitted, maybe disallow edit? Or allow if results not published. Prompt allows while editing is permitted.
  // We will allow if results are not published.

  const { criteriaScores, feedback, status } = req.body;
  const hackathonCriteria = review.submission.hackathon.judgingCriteria;

  let calculatedTotalScore = 0;
  const processedCriteriaScores = [];

  for (const inputScore of criteriaScores) {
    const matchedCriterion = hackathonCriteria.find(c => c.name === inputScore.criterionName);
    if (!matchedCriterion) throw new ApiError(400, `Unknown criterion: ${inputScore.criterionName}`);
    if (inputScore.score > matchedCriterion.maxScore) {
      throw new ApiError(400, `Score for ${matchedCriterion.name} cannot exceed maxScore of ${matchedCriterion.maxScore}`);
    }

    calculatedTotalScore += inputScore.score;
    processedCriteriaScores.push({
      criterionName: matchedCriterion.name,
      score: inputScore.score,
      maxScore: matchedCriterion.maxScore,
    });
  }

  if (processedCriteriaScores.length !== hackathonCriteria.length) {
    throw new ApiError(400, 'All judging criteria must be evaluated');
  }

  review.criteriaScores = processedCriteriaScores;
  review.totalScore = calculatedTotalScore;
  if (feedback !== undefined) review.feedback = feedback;
  if (status) review.status = status;
  
  if (status === 'submitted' && !review.submittedAt) {
    review.submittedAt = new Date();
    
    // Update assignment status
    await JudgeAssignment.findOneAndUpdate(
      { submission: review.submission._id, judge: req.user._id },
      { status: 'reviewed' }
    );

    await createNotification({
      recipient: review.submission.hackathon.organizer,
      type: 'evaluation_completed',
      title: 'Evaluation Completed',
      message: `A judge has submitted an evaluation for a project in ${review.submission.hackathon.title}.`,
      link: `/organizer/hackathons/${review.submission.hackathon._id}/submissions`,
      metadata: { eventKey: `eval_comp:${review._id.toString()}` }
    });
  }

  await review.save();

  res.status(200).json({ success: true, data: review });
});

// @desc    Get reviews for a submission
// @route   GET /api/submissions/:id/reviews
// @access  Private (Organizer owner, Admin, Judge owner)
const getSubmissionReviews = asyncHandler(async (req, res) => {
  const submissionId = req.params.id;
  const submission = await Submission.findById(submissionId).populate('hackathon');
  if (!submission) throw new ApiError(404, 'Submission not found');

  const isOrganizer = req.user.role === 'organizer' && submission.hackathon.organizer.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  const isJudge = req.user.role === 'judge'; // If judge, we only return their own review
  const isParticipant = req.user.role === 'participant';

  if (!isOrganizer && !isAdmin && !isJudge && !isParticipant) {
    throw new ApiError(403, 'Unauthorized');
  }

  let query = { submission: submissionId };

  if (isJudge && !isOrganizer && !isAdmin) {
    query.judge = req.user._id;
  } else if (isParticipant) {
    // Participants can only see reviews if results are published
    if (!submission.hackathon.resultsPublished) {
      throw new ApiError(403, 'Reviews are not public yet');
    }
    // Only return submitted reviews, not drafts
    query.status = 'submitted';
  }

  const reviews = await Review.find(query).populate('judge', 'name avatar');
  res.status(200).json({ success: true, data: reviews });
});

module.exports = {
  createReview,
  updateReview,
  getSubmissionReviews,
};
