const express = require('express');
const { 
  getMyInvitations, 
  acceptInvitation, 
  rejectInvitation 
} = require('../controllers/invitationController');
const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const validateObjectId = require('../middleware/validateObjectId');

const router = express.Router();

router.get('/me', protect, authorize('participant'), getMyInvitations);
router.patch('/:id/accept', protect, authorize('participant'), validateObjectId('id'), acceptInvitation);
router.patch('/:id/reject', protect, authorize('participant'), validateObjectId('id'), rejectInvitation);

module.exports = router;
