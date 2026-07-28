const express = require('express');
const { updateProfile, getPublicProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { updateProfileSchema } = require('../validators/authValidator');
const validateObjectId = require('../middleware/validateObjectId');

const router = express.Router();

router.put('/me', protect, validate(updateProfileSchema), updateProfile);
router.get('/:id/profile', validateObjectId('id'), getPublicProfile);

module.exports = router;
