const User = require('../models/User');
const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError } = require('../utils/ApiError');

// @desc    Update user profile
// @route   PUT /api/users/me
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  // Mass assignment protection: whitelist fields
  const { name, bio, skills, github, linkedin, portfolio, college } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (name !== undefined) user.name = name;
  if (bio !== undefined) user.bio = bio;
  if (skills !== undefined) user.skills = skills;
  if (github !== undefined) user.github = github;
  if (linkedin !== undefined) user.linkedin = linkedin;
  if (portfolio !== undefined) user.portfolio = portfolio;
  if (college !== undefined) user.college = college;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: user,
  });
});

// @desc    Get public profile of a user
// @route   GET /api/users/:id/profile
// @access  Public
const getPublicProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select(
    'name avatar bio skills github linkedin portfolio college role'
  );

  if (!user || user.isBlocked) {
    throw new ApiError(404, 'User not found or unavailable');
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

module.exports = {
  updateProfile,
  getPublicProfile,
};
