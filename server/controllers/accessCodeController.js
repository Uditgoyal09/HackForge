const crypto = require('crypto');
const RoleAccessCode = require('../models/RoleAccessCode');
const ActivityLog = require('../models/ActivityLog');
const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError } = require('../utils/ApiError');

// Helper to hash raw code
const hashCode = (code) => {
  return crypto.createHash('sha256').update(code.trim()).digest('hex');
};

// @desc    Generate a new role access code (Admin only)
// @route   POST /api/admin/access-codes
// @access  Private (Admin)
const createAccessCode = asyncHandler(async (req, res) => {
  const { role, label, expiresAt, maxUses } = req.body;

  if (!role || !['organizer', 'judge'].includes(role)) {
    throw new ApiError(400, 'Role must be organizer or judge');
  }

  if (!label || !label.trim()) {
    throw new ApiError(400, 'Label is required');
  }

  const expiryDate = new Date(expiresAt);
  if (isNaN(expiryDate.getTime()) || expiryDate <= new Date()) {
    throw new ApiError(400, 'Expiration date must be in the future');
  }

  const uses = Number(maxUses) || 1;
  if (uses < 1) {
    throw new ApiError(400, 'Maximum uses must be at least 1');
  }

  // Generate cryptographically secure random code
  const randomSegment = crypto.randomBytes(4).toString('hex').toUpperCase();
  const prefix = role === 'organizer' ? 'ORG' : 'JDG';
  const rawCode = `${prefix}-${randomSegment}`;
  const codeHash = hashCode(rawCode);

  const accessCode = await RoleAccessCode.create({
    codeHash,
    role,
    label: label.trim(),
    expiresAt: expiryDate,
    maxUses: uses,
    createdBy: req.user._id,
  });

  await ActivityLog.create({
    user: req.user._id,
    action: 'access_code_created',
    entityType: 'RoleAccessCode',
    entityId: accessCode._id,
  });

  // Return raw code ONCE to Admin for copying
  res.status(201).json({
    success: true,
    data: accessCode,
    rawCode,
  });
});

// @desc    Get all access codes with computed status (Admin only)
// @route   GET /api/admin/access-codes
// @access  Private (Admin)
const getAccessCodes = asyncHandler(async (req, res) => {
  const codes = await RoleAccessCode.find()
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

  const now = new Date();
  const formattedCodes = codes.map((c) => {
    let status = 'ACTIVE';
    if (!c.isActive) {
      status = 'REVOKED';
    } else if (c.usedCount >= c.maxUses) {
      status = 'EXHAUSTED';
    } else if (new Date(c.expiresAt) <= now) {
      status = 'EXPIRED';
    }

    return {
      _id: c._id,
      role: c.role,
      label: c.label,
      isActive: c.isActive,
      expiresAt: c.expiresAt,
      maxUses: c.maxUses,
      usedCount: c.usedCount,
      status,
      createdBy: c.createdBy,
      lastUsedAt: c.lastUsedAt,
      createdAt: c.createdAt,
    };
  });

  res.status(200).json({ success: true, data: formattedCodes });
});

// @desc    Revoke an access code (Admin only)
// @route   PATCH /api/admin/access-codes/:id/revoke
// @access  Private (Admin)
const revokeAccessCode = asyncHandler(async (req, res) => {
  const code = await RoleAccessCode.findById(req.params.id);
  if (!code) {
    throw new ApiError(404, 'Access code not found');
  }

  code.isActive = false;
  await code.save();

  await ActivityLog.create({
    user: req.user._id,
    action: 'access_code_revoked',
    entityType: 'RoleAccessCode',
    entityId: code._id,
  });

  res.status(200).json({ success: true, message: 'Access code revoked successfully' });
});

module.exports = {
  hashCode,
  createAccessCode,
  getAccessCodes,
  revokeAccessCode,
};
