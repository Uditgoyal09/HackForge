const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    hackathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hackathon',
      required: true,
    },
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: Date,
    rejectionReason: String,
  },
  { timestamps: true }
);

// Prevent duplicate registration per participant/hackathon
registrationSchema.index({ hackathon: 1, participant: 1 }, { unique: true });
registrationSchema.index({ hackathon: 1, team: 1 });

const Registration = mongoose.model('Registration', registrationSchema);
module.exports = Registration;
