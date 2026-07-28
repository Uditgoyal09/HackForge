const express = require('express');
const { 
  getTeam, 
  leaveTeam, 
  joinTeamByCode, 
  removeMember 
} = require('../controllers/teamController');
const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const validateObjectId = require('../middleware/validateObjectId');

const { inviteMember } = require('../controllers/invitationController');
const validate = require('../middleware/validate');
const { inviteMemberSchema } = require('../validators/teamValidator');

const router = express.Router();

// Base route: /api/teams

router.get('/:id', protect, validateObjectId('id'), getTeam);
router.post('/:id/leave', protect, authorize('participant'), validateObjectId('id'), leaveTeam);
router.post('/join/:inviteCode', protect, authorize('participant'), joinTeamByCode);
router.delete('/:id/members/:userId', protect, authorize('participant'), validateObjectId('id'), validateObjectId('userId'), removeMember);

// Nested Invitations
router.post('/:id/invitations', protect, authorize('participant'), validateObjectId('id'), validate(inviteMemberSchema), inviteMember);

module.exports = router;
