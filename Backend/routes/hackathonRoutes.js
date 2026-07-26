import express from 'express';
import {
  createHackathon,
  getAllHackathons,
  getHackathonById,
  updateHackathon,
  deleteHackathon
} from '../controllers/hackathonController.js';
import upload from '../middleware/upload.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllHackathons);
router.get('/:id', getHackathonById);

// Protected routes (Organizer & Admin only)
router.post('/', protect, authorize('organizer', 'admin'), upload.single('bannerImage'), createHackathon);
router.put('/:id', protect, authorize('organizer', 'admin'), upload.single('bannerImage'), updateHackathon);
router.delete('/:id', protect, authorize('organizer', 'admin'), deleteHackathon);

export default router;
