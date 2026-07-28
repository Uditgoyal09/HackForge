const express = require('express');
const { 
  updateSubmission, 
  getSubmission 
} = require('../controllers/submissionController');
const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const validateObjectId = require('../middleware/validateObjectId');
const validate = require('../middleware/validate');
const { submitProjectSchema, updateProjectSchema } = require('../validators/submissionValidator');
const { submitReviewSchema } = require('../validators/reviewValidator');
const { assignJudge, removeJudgeAssignment } = require('../controllers/judgeController');
const { createReview, getSubmissionReviews } = require('../controllers/reviewController');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/:id', protect, validateObjectId('id'), getSubmission);

router.put('/:id', 
  protect, 
  authorize('participant'), 
  validateObjectId('id'),
  upload.fields([
    { name: 'presentation', maxCount: 1 },
    { name: 'screenshots', maxCount: 5 }
  ]),
  validate(updateProjectSchema), 
  updateSubmission
);

// Nested Judges
router.post('/:id/judges/:judgeId', protect, authorize('admin', 'organizer'), validateObjectId('id'), validateObjectId('judgeId'), assignJudge);
router.delete('/:id/judges/:judgeId', protect, authorize('admin', 'organizer'), validateObjectId('id'), validateObjectId('judgeId'), removeJudgeAssignment);

// Nested Reviews
router.post('/:id/reviews', protect, authorize('judge'), validateObjectId('id'), validate(submitReviewSchema), createReview);
router.get('/:id/reviews', protect, validateObjectId('id'), getSubmissionReviews);

module.exports = router;
