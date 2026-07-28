const express = require('express');
const { 
  getMyRegistrations, 
  approveRegistration, 
  rejectRegistration 
} = require('../controllers/registrationController');
const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const validateObjectId = require('../middleware/validateObjectId');

const router = express.Router();

// Base route: /api/registrations

router.get('/me', protect, getMyRegistrations);
router.patch('/:id/approve', protect, authorize('admin', 'organizer'), validateObjectId('id'), approveRegistration);
router.patch('/:id/reject', protect, authorize('admin', 'organizer'), validateObjectId('id'), rejectRegistration);

module.exports = router;
