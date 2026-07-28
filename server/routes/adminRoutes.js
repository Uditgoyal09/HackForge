const express = require('express');
const { 
  getUsers, 
  blockUser, 
  unblockUser, 
  changeUserRole, 
  getAdminHackathons, 
  getAdminTeams, 
  getAdminSubmissions, 
  getActivityLogs 
} = require('../controllers/adminController');
const { getPlatformAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const validateObjectId = require('../middleware/validateObjectId');

const router = express.Router();

// All routes here are admin only
router.use(protect, authorize('admin'));

router.get('/analytics', getPlatformAnalytics);
router.get('/activity-logs', getActivityLogs);

router.get('/users', getUsers);
router.patch('/users/:id/block', validateObjectId('id'), blockUser);
router.patch('/users/:id/unblock', validateObjectId('id'), unblockUser);
router.patch('/users/:id/role', validateObjectId('id'), changeUserRole);

router.get('/hackathons', getAdminHackathons);
router.get('/teams', getAdminTeams);
router.get('/submissions', getAdminSubmissions);

module.exports = router;
