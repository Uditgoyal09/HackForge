const mongoose = require('mongoose');

const judgeAssignmentSchema = new mongoose.Schema(
  {
    hackathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hackathon',
      required: true,
    },
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
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['assigned', 'reviewed'],
      default: 'assigned',
    },
  },
  { timestamps: true }
);

// Prevent duplicate assignments
judgeAssignmentSchema.index({ submission: 1, judge: 1 }, { unique: true });
judgeAssignmentSchema.index({ hackathon: 1, judge: 1 });

const JudgeAssignment = mongoose.model('JudgeAssignment', judgeAssignmentSchema);
module.exports = JudgeAssignment;
