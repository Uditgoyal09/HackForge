const User = require('../models/User');
const Hackathon = require('../models/Hackathon');
const Team = require('../models/Team');
const Submission = require('../models/Submission');
const ActivityLog = require('../models/ActivityLog');
const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError } = require('../utils/ApiError');

// --- USER MANAGEMENT ---

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = asyncHandler(async (req, res) => {
  const { search, role, isBlocked, page = 1, limit = 10 } = req.query;
  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  if (role) query.role = role;
  if (isBlocked !== undefined) query.isBlocked = isBlocked === 'true';

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const users = await User.find(query).skip(skip).limit(limitNum).sort({ createdAt: -1 });
  const total = await User.countDocuments(query);

  res.status(200).json({
    success: true,
    data: users,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

// @desc    Block user
// @route   PATCH /api/admin/users/:id/block
// @access  Private (Admin)
const blockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');

  if (user._id.toString() === req.user._id.toString()) {
    throw new ApiError(400, 'You cannot block yourself');
  }

  user.isBlocked = true;
  await user.save();

  await ActivityLog.create({
    user: req.user._id,
    action: 'user_blocked',
    entityType: 'User',
    entityId: user._id,
  });

  res.status(200).json({ success: true, message: 'User blocked successfully' });
});

// @desc    Unblock user
// @route   PATCH /api/admin/users/:id/unblock
// @access  Private (Admin)
const unblockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');

  user.isBlocked = false;
  await user.save();

  await ActivityLog.create({
    user: req.user._id,
    action: 'user_unblocked',
    entityType: 'User',
    entityId: user._id,
  });

  res.status(200).json({ success: true, message: 'User unblocked successfully' });
});

// @desc    Change user role
// @route   PATCH /api/admin/users/:id/role
// @access  Private (Admin)
const changeUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['admin', 'organizer', 'participant', 'judge'].includes(role)) {
    throw new ApiError(400, 'Invalid role');
  }

  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');

  if (user._id.toString() === req.user._id.toString() && role !== 'admin') {
    throw new ApiError(400, 'You cannot downgrade your own admin status');
  }

  user.role = role;
  await user.save();

  await ActivityLog.create({
    user: req.user._id,
    action: 'role_changed',
    entityType: 'User',
    entityId: user._id,
    metadata: { newRole: role }
  });

  res.status(200).json({ success: true, message: 'User role updated', data: user });
});

// --- ENTITY MANAGEMENT ---

const getAdminHackathons = asyncHandler(async (req, res) => {
  const hackathons = await Hackathon.find().populate('organizer', 'name email').sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: hackathons });
});

const getAdminTeams = asyncHandler(async (req, res) => {
  const teams = await Team.find().populate('hackathon', 'title').populate('leader', 'name email').sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: teams });
});

const getAdminSubmissions = asyncHandler(async (req, res) => {
  const submissions = await Submission.find().populate('hackathon', 'title').populate('team', 'name').sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: submissions });
});

const getActivityLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  const logs = await ActivityLog.find()
    .populate('user', 'name email role')
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  const total = await ActivityLog.countDocuments();

  res.status(200).json({
    success: true,
    data: logs,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

module.exports = {
  getUsers,
  blockUser,
  unblockUser,
  changeUserRole,
  getAdminHackathons,
  getAdminTeams,
  getAdminSubmissions,
  getActivityLogs,
};
