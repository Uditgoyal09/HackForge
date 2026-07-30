const Hackathon = require('../models/Hackathon');
const ActivityLog = require('../models/ActivityLog');
const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError } = require('../utils/ApiError');
const User = require('../models/User');
const { createNotification } = require('../services/notificationService');

// Reusable logic to determine hackathon status based on dates
const determineStatus = (hackathon) => {
  if (hackathon.status === 'draft' || hackathon.status === 'cancelled') {
    return hackathon.status;
  }
  const now = new Date();
  if (now < hackathon.startDate) return 'upcoming';
  if (now >= hackathon.startDate && now <= hackathon.endDate) return 'ongoing';
  return 'completed';
};

// @desc    Create a hackathon
// @route   POST /api/hackathons
// @access  Private (Organizer)
const createHackathon = asyncHandler(async (req, res) => {
  const hackathonData = {
    ...req.body,
    organizer: req.user._id,
    status: 'upcoming', // default start
  };

  if (req.body.judges && Array.isArray(req.body.judges)) {
    const uniqueJudges = [...new Set(req.body.judges)];
    const validUsers = await User.find({ _id: { $in: uniqueJudges }, role: 'judge', isBlocked: false });
    
    if (validUsers.length !== uniqueJudges.length) {
      throw new ApiError(400, 'One or more provided judge IDs are invalid or not a judge');
    }

    hackathonData.judges = validUsers.map(user => ({
      user: user._id,
      assignedBy: req.user._id,
      assignedAt: new Date(),
      status: 'active',
      canPublishResults: false
    }));
  }

  const hackathon = await Hackathon.create(hackathonData);

  if (hackathon.judges && hackathon.judges.length > 0) {
    for (const judge of hackathon.judges) {
      await createNotification({
        recipient: judge.user,
        type: 'judge_assigned',
        title: 'Assigned as Hackathon Judge',
        message: `You have been assigned as a judge for the hackathon: ${hackathon.title}`,
        link: '/judge/dashboard',
        metadata: { eventKey: `judge_assgn_hck:${hackathon._id}` }
      });
      await ActivityLog.create({
        user: req.user._id,
        action: 'judge_assigned',
        entityType: 'Hackathon',
        entityId: hackathon._id,
        hackathonId: hackathon._id,
        description: `Assigned judge ${judge.user}`,
      });
    }
  }

  await ActivityLog.create({
    user: req.user._id,
    action: 'hackathon_created',
    entityType: 'Hackathon',
    entityId: hackathon._id,
  });

  res.status(201).json({
    success: true,
    data: hackathon,
  });
});

// @desc    Get all hackathons (with search, filter, pagination)
// @route   GET /api/hackathons
// @access  Public
const getHackathons = asyncHandler(async (req, res) => {
  const { search, mode, status, registrationStatus, page = 1, limit = 12, sort } = req.query;
  const query = {};

  if (search) {
    query.$text = { $search: search };
  }
  if (mode) query.mode = mode;
  if (registrationStatus) query.registrationStatus = registrationStatus;
  
  // Strict status matching or dynamic date matching?
  // We'll store it explicitly for now, but dynamic would be better in a cron job.
  if (status) query.status = status;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  // Sorting
  let sortObj = { createdAt: -1 };
  if (sort === 'newest') sortObj = { createdAt: -1 };
  if (sort === 'oldest') sortObj = { createdAt: 1 };
  if (sort === 'startDate') sortObj = { startDate: 1 };
  if (sort === 'prizePool') sortObj = { prizePool: -1 };

  const hackathons = await Hackathon.find(query)
    .sort(sortObj)
    .skip(skip)
    .limit(limitNum)
    .populate('organizer', 'name avatar');

  const total = await Hackathon.countDocuments(query);

  res.status(200).json({
    success: true,
    data: hackathons,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

// @desc    Get single hackathon
// @route   GET /api/hackathons/:id
// @access  Public
const getHackathon = asyncHandler(async (req, res) => {
  const hackathon = await Hackathon.findById(req.params.id)
    .populate('organizer', 'name avatar bio');

  if (!hackathon) {
    throw new ApiError(404, 'Hackathon not found');
  }

  // Dynamically compute status for accurate read
  hackathon.status = determineStatus(hackathon);

  res.status(200).json({
    success: true,
    data: hackathon,
  });
});

// @desc    Update hackathon
// @route   PUT /api/hackathons/:id
// @access  Private (Organizer owner or Admin)
const updateHackathon = asyncHandler(async (req, res) => {
  const hackathon = await Hackathon.findById(req.params.id);

  if (!hackathon) {
    throw new ApiError(404, 'Hackathon not found');
  }

  // Ownership Check
  if (req.user.role !== 'admin' && hackathon.organizer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to update this hackathon');
  }

  // Prevent editing if it's already completed or cancelled?
  if (hackathon.status === 'completed' || hackathon.status === 'cancelled') {
    throw new ApiError(400, `Cannot update a ${hackathon.status} hackathon`);
  }

  // Date validations if dates are updated
  const updatedStartDate = req.body.startDate ? new Date(req.body.startDate) : hackathon.startDate;
  const updatedEndDate = req.body.endDate ? new Date(req.body.endDate) : hackathon.endDate;
  const updatedRegDeadline = req.body.registrationDeadline ? new Date(req.body.registrationDeadline) : hackathon.registrationDeadline;
  const updatedSubDeadline = req.body.submissionDeadline ? new Date(req.body.submissionDeadline) : hackathon.submissionDeadline;

  if (updatedRegDeadline >= updatedStartDate) throw new ApiError(400, 'Registration deadline must be before start date');
  if (updatedStartDate > updatedSubDeadline) throw new ApiError(400, 'Start date must be before or equal to submission deadline');
  if (updatedSubDeadline > updatedEndDate) throw new ApiError(400, 'Submission deadline must be before or equal to end date');

  if (req.body.judges && Array.isArray(req.body.judges)) {
    const uniqueJudges = [...new Set(req.body.judges)];
    const validUsers = await User.find({ _id: { $in: uniqueJudges }, role: 'judge', isBlocked: false });
    
    if (validUsers.length !== uniqueJudges.length) {
      throw new ApiError(400, 'One or more provided judge IDs are invalid or not a judge');
    }

    // Retain existing judges that are still in the array, add new ones
    const currentJudges = hackathon.judges || [];
    const currentJudgeIds = currentJudges.map(j => j.user.toString());
    
    const newJudgesArray = [];
    
    for (const judgeId of uniqueJudges) {
      if (currentJudgeIds.includes(judgeId.toString())) {
        // Keep existing
        newJudgesArray.push(currentJudges.find(j => j.user.toString() === judgeId.toString()));
      } else {
        // Add new
        newJudgesArray.push({
          user: judgeId,
          assignedBy: req.user._id,
          assignedAt: new Date(),
          status: 'active',
          canPublishResults: false
        });
        
        // Notify new judge
        await createNotification({
          recipient: judgeId,
          type: 'judge_assigned',
          title: 'Assigned as Hackathon Judge',
          message: `You have been assigned as a judge for the hackathon: ${hackathon.title}`,
          link: '/judge/dashboard',
          metadata: { eventKey: `judge_assgn_hck:${hackathon._id}` }
        });
        
        await ActivityLog.create({
          user: req.user._id,
          action: 'judge_assigned',
          entityType: 'Hackathon',
          entityId: hackathon._id,
          hackathonId: hackathon._id,
          description: `Assigned judge ${judgeId}`,
        });
      }
    }
    
    // Unassigned judges
    const removedJudgeIds = currentJudgeIds.filter(id => !uniqueJudges.includes(id));
    for (const removedId of removedJudgeIds) {
      await createNotification({
        recipient: removedId,
        type: 'judge_unassigned',
        title: 'Removed from Hackathon',
        message: `Your judging assignment for ${hackathon.title} has been removed.`,
        metadata: { eventKey: `judge_unassgn_hck:${hackathon._id}` }
      });
      await ActivityLog.create({
        user: req.user._id,
        action: 'judge_unassigned',
        entityType: 'Hackathon',
        entityId: hackathon._id,
        hackathonId: hackathon._id,
        description: `Unassigned judge ${removedId}`,
      });
    }

    req.body.judges = newJudgesArray;
  }

  Object.assign(hackathon, req.body);
  await hackathon.save();

  await ActivityLog.create({
    user: req.user._id,
    action: 'hackathon_updated',
    entityType: 'Hackathon',
    entityId: hackathon._id,
  });

  res.status(200).json({
    success: true,
    data: hackathon,
  });
});

// @desc    Delete hackathon
// @route   DELETE /api/hackathons/:id
// @access  Private (Organizer owner or Admin)
const deleteHackathon = asyncHandler(async (req, res) => {
  const hackathon = await Hackathon.findById(req.params.id);

  if (!hackathon) {
    throw new ApiError(404, 'Hackathon not found');
  }

  if (req.user.role !== 'admin' && hackathon.organizer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to delete this hackathon');
  }

  // Soft delete or cascade delete? 
  // We will change status to cancelled to prevent orphaned records.
  hackathon.status = 'cancelled';
  await hackathon.save();

  await ActivityLog.create({
    user: req.user._id,
    action: 'hackathon_deleted', // Actually cancelled
    entityType: 'Hackathon',
    entityId: hackathon._id,
  });

  res.status(200).json({
    success: true,
    message: 'Hackathon cancelled successfully',
  });
});

// @desc    Open Registration
// @route   PATCH /api/hackathons/:id/registration/open
// @access  Private (Organizer owner)
const openRegistration = asyncHandler(async (req, res) => {
  const hackathon = await Hackathon.findById(req.params.id);
  if (!hackathon) throw new ApiError(404, 'Hackathon not found');
  if (req.user.role !== 'admin' && hackathon.organizer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized');
  }

  hackathon.registrationStatus = 'open';
  await hackathon.save();

  res.status(200).json({ success: true, message: 'Registration opened' });
});

// @desc    Close Registration
// @route   PATCH /api/hackathons/:id/registration/close
// @access  Private (Organizer owner)
const closeRegistration = asyncHandler(async (req, res) => {
  const hackathon = await Hackathon.findById(req.params.id);
  if (!hackathon) throw new ApiError(404, 'Hackathon not found');
  if (req.user.role !== 'admin' && hackathon.organizer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized');
  }

  hackathon.registrationStatus = 'closed';
  await hackathon.save();

  res.status(200).json({ success: true, message: 'Registration closed' });
});

// @desc    Get Scoped Hackathon Activity
// @route   GET /api/hackathons/:id/activity
// @access  Private (Organizer, Assigned Judge, Admin)
const getHackathonActivity = asyncHandler(async (req, res) => {
  const hackathon = await Hackathon.findById(req.params.id);
  if (!hackathon) throw new ApiError(404, 'Hackathon not found');

  const isOrganizer = hackathon.organizer.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  const isJudge = hackathon.judges?.some(j => j.user.toString() === req.user._id.toString() && j.status === 'active');

  if (!isOrganizer && !isAdmin && !isJudge) {
    throw new ApiError(403, 'You do not have permission to view this hackathon\'s activity');
  }

  const activities = await ActivityLog.find({ hackathonId: hackathon._id })
    .sort({ createdAt: -1 })
    .limit(50); // Just top 50 recent activities for now

  res.status(200).json({ success: true, data: activities });
});

module.exports = {
  createHackathon,
  getHackathons,
  getHackathon,
  updateHackathon,
  deleteHackathon,
  openRegistration,
  closeRegistration,
  getHackathonActivity,
};
