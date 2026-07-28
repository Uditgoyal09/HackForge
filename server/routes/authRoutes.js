const express = require('express');
const { signup, login, logout, getCurrentUser, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { signupSchema, loginSchema, changePasswordSchema } = require('../validators/authValidator');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/signup', authLimiter, validate(signupSchema), signup);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/logout', protect, logout);
router.get('/me', protect, getCurrentUser);
router.put('/change-password', protect, validate(changePasswordSchema), changePassword);

module.exports = router;
