import express from 'express';
import { registerForHackathon, checkRegistrationStatus } from '../controllers/registrationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Both routes are protected and limited to participants
router.post('/:hackathonId', protect, authorize('participant'), registerForHackathon);
router.get('/check/:hackathonId', protect, authorize('participant'), checkRegistrationStatus);

export default router;
