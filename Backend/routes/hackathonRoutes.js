import express from 'express';
import {
  createHackathon,
  getAllHackathons,
  getHackathonById,
  updateHackathon,
  deleteHackathon,
  getHackathonsByOrganizer
} from '../controllers/hackathonController.js';
import upload from '../middleware/upload.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllHackathons);

// Protected routes (Organizer & Admin only)
router.get('/organizer/me', protect, authorize('organizer', 'admin'), getHackathonsByOrganizer);
router.post('/', protect, authorize('organizer', 'admin'), upload.single('bannerImage'), createHackathon);
router.put('/:id', protect, authorize('organizer', 'admin'), upload.single('bannerImage'), updateHackathon);
router.delete('/:id', protect, authorize('organizer', 'admin'), deleteHackathon);

// Public route (needs to be after /organizer/me so it doesn't clash)
router.get('/:id', getHackathonById);

export default router;
