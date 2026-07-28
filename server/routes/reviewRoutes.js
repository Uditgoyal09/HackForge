const express = require('express');
const { updateReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { submitReviewSchema } = require('../validators/reviewValidator');
const validateObjectId = require('../middleware/validateObjectId');

const router = express.Router();

router.put('/:id', protect, authorize('judge'), validateObjectId('id'), validate(submitReviewSchema), updateReview);

module.exports = router;
