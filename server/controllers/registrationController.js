const Registration = require('../models/Registration');
const Hackathon = require('../models/Hackathon');
const ActivityLog = require('../models/ActivityLog');
const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError } = require('../utils/ApiError');

// @desc    Register for a hackathon
// @route   POST /api/hackathons/:id/register
// @access  Private (Participant)
const registerForHackathon = asyncHandler(async (req, res) => {
  const hackathonId = req.params.id;
  const participantId = req.user._id;

  const hackathon = await Hackathon.findById(hackathonId);
  if (!hackathon) throw new ApiError(404, 'Hackathon not found');

  if (hackathon.registrationStatus !== 'open') {
    throw new ApiError(400, 'Registration is currently closed for this hackathon');
  }

  if (new Date() > hackathon.registrationDeadline) {
    throw new ApiError(400, 'Registration deadline has passed');
  }

  // Check for existing registration
  const existingRegistration = await Registration.findOne({ hackathon: hackathonId, participant: participantId });
  if (existingRegistration) {
    throw new ApiError(409, 'You have already registered for this hackathon');
  }

  const registration = await Registration.create({
    hackathon: hackathonId,
    participant: participantId,
    status: 'pending', // Requires organizer approval
  });

  await ActivityLog.create({
    user: participantId,
    action: 'registration_created',
    entityType: 'Registration',
    entityId: registration._id,
  });

  res.status(201).json({
    success: true,
    message: 'Successfully registered for the hackathon',
    data: registration,
  });
});

// @desc    Cancel registration
// @route   DELETE /api/hackathons/:id/registration
// @access  Private (Participant)
const cancelRegistration = asyncHandler(async (req, res) => {
  const hackathonId = req.params.id;
  const participantId = req.user._id;

  const registration = await Registration.findOne({ hackathon: hackathonId, participant: participantId });
  if (!registration) throw new ApiError(404, 'Registration not found');

  // Business rule: prevent cancel if approved and team exists?
  // Let's just allow cancelling which might mark it as cancelled
  registration.status = 'cancelled';
  await registration.save();

  await ActivityLog.create({
    user: participantId,
    action: 'registration_cancelled',
    entityType: 'Registration',
    entityId: registration._id,
  });

  res.status(200).json({ success: true, message: 'Registration cancelled' });
});

// @desc    Get my registrations
// @route   GET /api/registrations/me
// @access  Private
const getMyRegistrations = asyncHandler(async (req, res) => {
  const registrations = await Registration.find({ participant: req.user._id })
    .populate('hackathon', 'title startDate endDate banner status mode');

  res.status(200).json({ success: true, data: registrations });
});

// @desc    Get registrations for a hackathon
// @route   GET /api/hackathons/:id/registrations
// @access  Private (Organizer owner or Admin)
const getHackathonRegistrations = asyncHandler(async (req, res) => {
  const hackathonId = req.params.id;
  
  const hackathon = await Hackathon.findById(hackathonId);
  if (!hackathon) throw new ApiError(404, 'Hackathon not found');

  if (req.user.role !== 'admin' && hackathon.organizer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Unauthorized access to registrations');
  }

  const registrations = await Registration.find({ hackathon: hackathonId })
    .populate('participant', 'name email avatar college skills')
    .populate('team', 'name status');

  res.status(200).json({ success: true, data: registrations });
});

// @desc    Approve registration
// @route   PATCH /api/registrations/:id/approve
// @access  Private (Organizer owner or Admin)
const approveRegistration = asyncHandler(async (req, res) => {
  const registration = await Registration.findById(req.params.id).populate('hackathon');
  if (!registration) throw new ApiError(404, 'Registration not found');

  if (req.user.role !== 'admin' && registration.hackathon.organizer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Unauthorized');
  }

  registration.status = 'approved';
  registration.reviewedBy = req.user._id;
  registration.reviewedAt = new Date();
  await registration.save();

  await ActivityLog.create({
    user: req.user._id,
    action: 'registration_approved',
    entityType: 'Registration',
    entityId: registration._id,
  });

  res.status(200).json({ success: true, message: 'Registration approved', data: registration });
});

// @desc    Reject registration
// @route   PATCH /api/registrations/:id/reject
// @access  Private (Organizer owner or Admin)
const rejectRegistration = asyncHandler(async (req, res) => {
  const { rejectionReason } = req.body;

  const registration = await Registration.findById(req.params.id).populate('hackathon');
  if (!registration) throw new ApiError(404, 'Registration not found');

  if (req.user.role !== 'admin' && registration.hackathon.organizer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Unauthorized');
  }

  registration.status = 'rejected';
  registration.rejectionReason = rejectionReason || 'No reason provided';
  registration.reviewedBy = req.user._id;
  registration.reviewedAt = new Date();
  await registration.save();

  await ActivityLog.create({
    user: req.user._id,
    action: 'registration_rejected',
    entityType: 'Registration',
    entityId: registration._id,
  });

  res.status(200).json({ success: true, message: 'Registration rejected', data: registration });
});

module.exports = {
  registerForHackathon,
  cancelRegistration,
  getMyRegistrations,
  getHackathonRegistrations,
  approveRegistration,
  rejectRegistration,
};
