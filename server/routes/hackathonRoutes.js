const express = require('express');
const { 
  createHackathon, 
  getHackathons, 
  getHackathon, 
  updateHackathon, 
  deleteHackathon,
  openRegistration,
  closeRegistration
} = require('../controllers/hackathonController');
const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { createHackathonSchema, updateHackathonSchema } = require('../validators/hackathonValidator');
const validateObjectId = require('../middleware/validateObjectId');

const { registerForHackathon, getHackathonRegistrations, cancelRegistration } = require('../controllers/registrationController');
const { createTeam } = require('../controllers/teamController');
const { createSubmission, getHackathonSubmissions } = require('../controllers/submissionController');
const { createTeamSchema } = require('../validators/teamValidator');
const { submitProjectSchema } = require('../validators/submissionValidator');
const { getLeaderboard, publishResults } = require('../controllers/leaderboardController');
const upload = require('../middleware/upload');

const router = express.Router();

router.route('/')
  .get(getHackathons)
  .post(protect, authorize('admin', 'organizer'), validate(createHackathonSchema), createHackathon);

router.route('/:id')
  .get(validateObjectId('id'), getHackathon)
  .put(protect, authorize('admin', 'organizer'), validateObjectId('id'), validate(updateHackathonSchema), updateHackathon)
  .delete(protect, authorize('admin', 'organizer'), validateObjectId('id'), deleteHackathon);

router.patch('/:id/registration/open', protect, authorize('admin', 'organizer'), validateObjectId('id'), openRegistration);
router.patch('/:id/registration/close', protect, authorize('admin', 'organizer'), validateObjectId('id'), closeRegistration);

// Nested Registration Routes
router.route('/:id/register')
  .post(protect, authorize('participant'), validateObjectId('id'), registerForHackathon)
  .delete(protect, authorize('participant'), validateObjectId('id'), cancelRegistration);

router.get('/:id/registrations', protect, authorize('admin', 'organizer'), validateObjectId('id'), getHackathonRegistrations);

// Nested Team Routes
router.post('/:id/teams', protect, authorize('participant'), validateObjectId('id'), validate(createTeamSchema), createTeam);

// Nested Submission Routes
router.route('/:id/submissions')
  .post(
    protect, 
    authorize('participant'), 
    validateObjectId('id'), 
    upload.fields([{ name: 'presentation', maxCount: 1 }, { name: 'screenshots', maxCount: 5 }]),
    validate(submitProjectSchema), 
    createSubmission
  )
  .get(protect, authorize('admin', 'organizer'), validateObjectId('id'), getHackathonSubmissions);

// Leaderboard and Results
router.get('/:id/leaderboard', validateObjectId('id'), getLeaderboard);
router.patch('/:id/publish-results', protect, authorize('admin', 'organizer'), validateObjectId('id'), publishResults);

module.exports = router;
