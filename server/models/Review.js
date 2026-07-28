const mongoose = require('mongoose');

const criteriaScoreSchema = new mongoose.Schema({
  criterionName: { type: String, required: true },
  score: { type: Number, required: true, min: 0 },
  maxScore: { type: Number, required: true, min: 1 },
}, { _id: false });

const reviewSchema = new mongoose.Schema(
  {
    submission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission',
      required: true,
    },
    judge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    criteriaScores: [criteriaScoreSchema],
    totalScore: {
      type: Number,
      required: true,
      min: 0,
    },
    feedback: {
      type: String,
    },
    status: {
      type: String,
      enum: ['draft', 'submitted'],
      default: 'draft',
    },
    submittedAt: Date,
  },
  { timestamps: true }
);

// One judge can review a specific submission only once
reviewSchema.index({ submission: 1, judge: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
