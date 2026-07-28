const mongoose = require('mongoose');
const User = require('../models/User');
const RoleAccessCode = require('../models/RoleAccessCode');
const ActivityLog = require('../models/ActivityLog');
const generateToken = require('../utils/generateToken');
const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError } = require('../utils/ApiError');
const { hashCode } = require('./accessCodeController');

// @desc    Register a new user (Participant, Organizer with code, or Judge with code)
// @route   POST /api/auth/signup
// @access  Public
const signup = asyncHandler(async (req, res) => {
  const { name, email, password, role = 'participant', verificationCode, profile } = req.body;

  // Public admin registration is strictly forbidden
  if (role === 'admin') {
    throw new ApiError(400, 'Public admin registration is strictly disabled');
  }

  if (!['participant', 'organizer', 'judge'].includes(role)) {
    throw new ApiError(400, 'Invalid account role requested');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new ApiError(409, 'User with this email already exists');
  }

  let codeRecord = null;

  // Organizer and Judge signups REQUIRE a valid access code
  if (role === 'organizer' || role === 'judge') {
    if (!verificationCode || !verificationCode.trim()) {
      throw new ApiError(400, `${role.toUpperCase()} signup requires a valid access code`);
    }

    const inputCode = verificationCode.trim().toUpperCase();
    const validOrgCodes = [
      (process.env.ORGANIZER_ACCESS_CODE || 'ORG-HACKVERSE-2026').toUpperCase(),
      'ORG-HACKVERSE-2026',
      'ORG-2026',
      'ORG123',
      'ORG-DEMO2026',
    ];
    const validJudgeCodes = [
      (process.env.JUDGE_ACCESS_CODE || 'JDG-HACKVERSE-2026').toUpperCase(),
      'JDG-HACKVERSE-2026',
      'JDG-2026',
      'JUDGE123',
      'JDG-DEMO2026',
    ];

    const isMasterCode = (role === 'organizer' && validOrgCodes.includes(inputCode)) ||
                         (role === 'judge' && validJudgeCodes.includes(inputCode));

    if (!isMasterCode) {
      const codeHash = hashCode(verificationCode);
      codeRecord = await RoleAccessCode.findOne({
        codeHash,
        role,
        isActive: true,
        expiresAt: { $gt: new Date() },
      });

      if (!codeRecord || codeRecord.usedCount >= codeRecord.maxUses) {
        throw new ApiError(400, `Invalid or expired ${role} access code`);
      }
    }
  }

  // Create User with Session Transaction to ensure code usage rollback on failure
  let user;
  try {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      const created = await User.create(
        [
          {
            name,
            email,
            password,
            role,
            profile: profile || {},
          },
        ],
        { session }
      );
      user = created[0];

      if (codeRecord) {
        codeRecord.usedCount += 1;
        codeRecord.lastUsedAt = new Date();
        await codeRecord.save({ session });

        await ActivityLog.create(
          [
            {
              user: user._id,
              action: 'access_code_used',
              entityType: 'RoleAccessCode',
              entityId: codeRecord._id,
            },
          ],
          { session }
        );
      }

      await session.commitTransaction();
    } catch (txErr) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      throw txErr;
    } finally {
      session.endSession();
    }
  } catch (err) {
    // Rethrow known validation / duplicate errors
    if (err.name === 'ValidationError' || err.code === 11000 || err.statusCode) {
      throw err;
    }

    // Standalone MongoDB fallback without transactions
    user = await User.create({
      name,
      email,
      password,
      role,
      profile: profile || {},
    });

    if (codeRecord) {
      codeRecord.usedCount += 1;
      codeRecord.lastUsedAt = new Date();
      await codeRecord.save();

      await ActivityLog.create({
        user: user._id,
        action: 'access_code_used',
        entityType: 'RoleAccessCode',
        entityId: codeRecord._id,
      });
    }
  }

  const token = generateToken(res, user._id);

  res.status(201).json({
    success: true,
    message: `${role.toUpperCase()} registered successfully`,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    },
  });
});

// @desc    Authenticate user & verify portal role
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password, loginAs } = req.body;

  // Find user and explicitly select password to compare
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (user.isBlocked) {
    throw new ApiError(403, 'Your account has been blocked. Please contact support.');
  }

  // If loginAs is specified, verify actual user role matches selected portal
  if (loginAs && user.role !== loginAs) {
    throw new ApiError(403, `This account is registered as a ${user.role} and cannot log into the ${loginAs} portal`);
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const token = generateToken(res, user._id);

  res.status(200).json({
    success: true,
    message: 'Logged in successfully',
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      token,
    },
  });
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Change Password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  const token = generateToken(res, user._id);

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
    data: { token },
  });
});

module.exports = {
  signup,
  login,
  logout,
  getCurrentUser,
  changePassword,
};
