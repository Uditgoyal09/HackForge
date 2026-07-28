const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    hackathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hackathon',
      required: true,
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    projectName: {
      type: String,
      required: true,
      trim: true,
    },
    problemStatement: { type: String, required: true },
    solution: { type: String, required: true },
    description: { type: String },
    githubRepository: { type: String },
    liveDemo: { type: String },
    techStack: [String],
    screenshots: [
      {
        url: String,
        publicId: String,
      }
    ],
    presentation: {
      url: String,
      publicId: String,
    },
    demoVideo: { type: String }, // YouTube/Vimeo URL
    status: {
      type: String,
      enum: ['pending', 'under_review', 'approved', 'rejected'],
      default: 'pending',
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    lastEditedAt: Date,
  },
  { timestamps: true }
);

// Only one submission per team per hackathon
submissionSchema.index({ hackathon: 1, team: 1 }, { unique: true });

const Submission = mongoose.model('Submission', submissionSchema);
module.exports = Submission;
