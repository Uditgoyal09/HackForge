const JudgeAssignment = require('../models/JudgeAssignment');
const Submission = require('../models/Submission');
const Hackathon = require('../models/Hackathon');
const ActivityLog = require('../models/ActivityLog');
const { createNotification } = require('../services/notificationService');
const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError } = require('../utils/ApiError');
const User = require('../models/User');

// @desc    Get available judges for a hackathon
// @route   GET /api/judges/available
// @access  Private (Organizer owner or Admin)
const getAvailableJudges = asyncHandler(async (req, res) => {
  const { search = '', page = 1, limit = 20 } = req.query;
  
  if (req.user.role !== 'admin' && req.user.role !== 'organizer') {
    throw new ApiError(403, 'Only organizers and admins can browse available judges');
  }

  const query = { role: 'judge', isBlocked: false };
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const [judges, total] = await Promise.all([
    User.find(query)
      .select('name email avatar bio skills')
      .skip(skip)
      .limit(limitNum)
      .lean(),
    User.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    data: judges,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum)
    }
  });
});

// @desc    Assign judge to submission
// @route   POST /api/submissions/:id/judges/:judgeId
// @access  Private (Organizer owner or Admin)
const assignJudge = asyncHandler(async (req, res) => {
  const submissionId = req.params.id;
  const judgeId = req.params.judgeId;

  const submission = await Submission.findById(submissionId).populate('hackathon');
  if (!submission) throw new ApiError(404, 'Submission not found');

  if (req.user.role !== 'admin' && submission.hackathon.organizer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Unauthorized');
  }

  // Validate Judge is in Hackathon pool
  const hackathonJudges = submission.hackathon.judges || [];
  const isJudgeInPool = hackathonJudges.some(j => j.user.toString() === judgeId.toString() && j.status === 'active');
  
  if (!isJudgeInPool) {
    throw new ApiError(403, 'This user is not an active judge in the Hackathon Judge Pool');
  }

  const existingAssignment = await JudgeAssignment.findOne({ submission: submissionId, judge: judgeId });
  if (existingAssignment) {
    throw new ApiError(409, 'Judge already assigned to this submission');
  }

  const assignment = await JudgeAssignment.create({
    hackathon: submission.hackathon._id,
    submission: submissionId,
    judge: judgeId,
    assignedBy: req.user._id,
  });

  await ActivityLog.create({
    user: req.user._id,
    action: 'judge_assigned',
    entityType: 'JudgeAssignment',
    entityId: assignment._id,
  });

  await createNotification({
    recipient: judgeId,
    type: 'judge_assigned',
    title: 'New Judging Assignment',
    message: `You have been assigned to evaluate a project for ${submission.hackathon.title}.`,
    link: '/judge/dashboard',
    metadata: { eventKey: `judge_assgn:${assignment._id.toString()}` }
  });

  res.status(201).json({ success: true, message: 'Judge assigned successfully', data: assignment });
});

// @desc    Remove judge assignment
// @route   DELETE /api/submissions/:id/judges/:judgeId
// @access  Private (Organizer owner or Admin)
const removeJudgeAssignment = asyncHandler(async (req, res) => {
  const submission = await Submission.findById(req.params.id).populate('hackathon');
  if (!submission) throw new ApiError(404, 'Submission not found');

  if (req.user.role !== 'admin' && submission.hackathon.organizer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Unauthorized');
  }

  const assignment = await JudgeAssignment.findOneAndDelete({ submission: req.params.id, judge: req.params.judgeId });
  if (!assignment) throw new ApiError(404, 'Assignment not found');

  res.status(200).json({ success: true, message: 'Judge assignment removed' });
});

// @desc    Get judge's assignments
// @route   GET /api/judge/assignments
// @access  Private (Judge)
const getJudgeAssignments = asyncHandler(async (req, res) => {
  const assignments = await JudgeAssignment.find({ judge: req.user._id })
    .populate({
      path: 'submission',
      select: 'projectName team status submittedAt',
      populate: { path: 'team', select: 'name' }
    })
    .populate('hackathon', 'title status');

  res.status(200).json({ success: true, data: assignments });
});

// @desc    Get hackathons the judge is assigned to
// @route   GET /api/judge/hackathons
// @access  Private (Judge)
const getJudgeHackathons = asyncHandler(async (req, res) => {
  const hackathons = await Hackathon.find({
    'judges.user': req.user._id,
    'judges.status': 'active'
  }).select('title description startDate endDate status logoUrl bannerUrl judges prizePool');

  res.status(200).json({ success: true, data: hackathons });
});

module.exports = {
  assignJudge,
  removeJudgeAssignment,
  getJudgeAssignments,
  getAvailableJudges,
  getJudgeHackathons,
};
