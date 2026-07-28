const express = require('express');
const { getOrganizerAnalytics } = require('../controllers/organizerController');
const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.get('/analytics', protect, authorize('organizer'), getOrganizerAnalytics);

module.exports = router;
