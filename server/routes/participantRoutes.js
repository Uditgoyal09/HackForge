const express = require('express');
const { getParticipantDashboard } = require('../controllers/participantController');
const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.get('/dashboard', protect, authorize('participant'), getParticipantDashboard);

module.exports = router;
