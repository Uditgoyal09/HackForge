const Submission = require('../models/Submission');
const Hackathon = require('../models/Hackathon');
const Team = require('../models/Team');
const ActivityLog = require('../models/ActivityLog');
const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError } = require('../utils/ApiError');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/fileUploadService');

// @desc    Submit a project
// @route   POST /api/hackathons/:id/submissions
// @access  Private (Participant/Leader)
const createSubmission = asyncHandler(async (req, res) => {
  const hackathonId = req.params.id;
  const participantId = req.user._id;

  const hackathon = await Hackathon.findById(hackathonId);
  if (!hackathon) throw new ApiError(404, 'Hackathon not found');

  // Enforce Deadline
  if (new Date() > hackathon.submissionDeadline) {
    throw new ApiError(403, 'Submission deadline has passed');
  }

  // Find user's active team for this hackathon
  const team = await Team.findOne({ hackathon: hackathonId, members: participantId, status: 'active' });
  if (!team) throw new ApiError(403, 'You must be in an active team to submit a project');

  // Check if team leader (policy: only leader can submit, or any member. We allow leader only for stricter control)
  if (team.leader.toString() !== participantId.toString()) {
    throw new ApiError(403, 'Only the team leader can submit the project');
  }

  // Check if submission already exists
  const existingSubmission = await Submission.findOne({ hackathon: hackathonId, team: team._id });
  if (existingSubmission) {
    throw new ApiError(409, 'Your team has already submitted a project');
  }

  // Process techStack if sent as array or string
  let techStackArray = [];
  if (req.body.techStack) {
    if (Array.isArray(req.body.techStack)) {
      techStackArray = req.body.techStack;
    } else {
      try {
        techStackArray = JSON.parse(req.body.techStack);
      } catch {
        techStackArray = req.body.techStack.split(',').map(s => s.trim());
      }
    }
  }

  // File Uploads
  let presentationData = null;
  const screenshotData = [];

  if (req.files) {
    if (req.files.presentation && req.files.presentation[0]) {
      presentationData = await uploadToCloudinary(req.files.presentation[0].buffer, 'hackverse/presentations');
    }

    if (req.files.screenshots) {
      for (const file of req.files.screenshots) {
        const result = await uploadToCloudinary(file.buffer, 'hackverse/screenshots');
        screenshotData.push(result);
      }
    }
  }

  const submission = await Submission.create({
    hackathon: hackathonId,
    team: team._id,
    projectName: req.body.projectName,
    problemStatement: req.body.problemStatement,
    solution: req.body.solution,
    description: req.body.description,
    githubRepository: req.body.githubRepository,
    liveDemo: req.body.liveDemo,
    demoVideo: req.body.demoVideo,
    techStack: techStackArray,
    presentation: presentationData,
    screenshots: screenshotData,
  });

  await ActivityLog.create({
    user: participantId,
    action: 'submission_created',
    entityType: 'Submission',
    entityId: submission._id,
  });

  res.status(201).json({ success: true, data: submission });
});

// @desc    Update a submission
// @route   PUT /api/submissions/:id
// @access  Private (Participant/Leader)
const updateSubmission = asyncHandler(async (req, res) => {
  const submissionId = req.params.id;
  const participantId = req.user._id;

  const submission = await Submission.findById(submissionId).populate('hackathon').populate('team');
  if (!submission) throw new ApiError(404, 'Submission not found');

  if (new Date() > submission.hackathon.submissionDeadline) {
    throw new ApiError(403, 'Submission deadline has passed, cannot edit');
  }

  if (submission.team.leader.toString() !== participantId.toString()) {
    throw new ApiError(403, 'Only the team leader can update the project');
  }

  // Process techStack
  let techStackArray = submission.techStack;
  if (req.body.techStack) {
    try {
      techStackArray = JSON.parse(req.body.techStack);
    } catch {
      techStackArray = req.body.techStack.split(',').map(s => s.trim());
    }
  }

  // File Uploads & Cleanup
  if (req.files) {
    if (req.files.presentation && req.files.presentation[0]) {
      if (submission.presentation && submission.presentation.publicId) {
        await deleteFromCloudinary(submission.presentation.publicId);
      }
      submission.presentation = await uploadToCloudinary(req.files.presentation[0].buffer, 'hackverse/presentations');
    }

    if (req.files.screenshots && req.files.screenshots.length > 0) {
      // For simplicity, we replace all screenshots if new ones are uploaded
      if (submission.screenshots && submission.screenshots.length > 0) {
        for (const sc of submission.screenshots) {
          await deleteFromCloudinary(sc.publicId);
        }
      }
      submission.screenshots = [];
      for (const file of req.files.screenshots) {
        const result = await uploadToCloudinary(file.buffer, 'hackverse/screenshots');
        submission.screenshots.push(result);
      }
    }
  }

  submission.projectName = req.body.projectName || submission.projectName;
  submission.problemStatement = req.body.problemStatement || submission.problemStatement;
  submission.solution = req.body.solution || submission.solution;
  submission.description = req.body.description !== undefined ? req.body.description : submission.description;
  submission.githubRepository = req.body.githubRepository !== undefined ? req.body.githubRepository : submission.githubRepository;
  submission.liveDemo = req.body.liveDemo !== undefined ? req.body.liveDemo : submission.liveDemo;
  submission.demoVideo = req.body.demoVideo !== undefined ? req.body.demoVideo : submission.demoVideo;
  submission.techStack = techStackArray;
  submission.lastEditedAt = new Date();

  await submission.save();

  await ActivityLog.create({
    user: participantId,
    action: 'submission_updated',
    entityType: 'Submission',
    entityId: submission._id,
  });

  res.status(200).json({ success: true, data: submission });
});

// @desc    Get submission details
// @route   GET /api/submissions/:id
// @access  Private (Team member, Judge, Organizer, Admin)
const getSubmission = asyncHandler(async (req, res) => {
  const submission = await Submission.findById(req.params.id)
    .populate('team', 'name leader members status')
    .populate('hackathon', 'title status resultsPublished');

  if (!submission) throw new ApiError(404, 'Submission not found');

  // Authorization aware
  const isMember = submission.team.members.some(m => m.toString() === req.user._id.toString());
  const isOrganizer = req.user.role === 'organizer' && submission.hackathon.organizer.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  const isJudge = req.user.role === 'judge'; // Ideally check judge assignment here or in a separate judge route

  if (!isMember && !isOrganizer && !isAdmin && !isJudge && !submission.hackathon.resultsPublished) {
    throw new ApiError(403, 'You do not have permission to view this submission yet');
  }

  res.status(200).json({ success: true, data: submission });
});

// @desc    Get submissions for a hackathon
// @route   GET /api/hackathons/:id/submissions
// @access  Private (Organizer owner or Admin)
const getHackathonSubmissions = asyncHandler(async (req, res) => {
  const hackathon = await Hackathon.findById(req.params.id);
  if (!hackathon) throw new ApiError(404, 'Hackathon not found');

  if (req.user.role !== 'admin' && hackathon.organizer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Unauthorized');
  }

  const submissions = await Submission.find({ hackathon: req.params.id })
    .populate('team', 'name status');

  res.status(200).json({ success: true, data: submissions });
});

module.exports = {
  createSubmission,
  updateSubmission,
  getSubmission,
  getHackathonSubmissions,
};
