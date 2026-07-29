const mongoose = require('mongoose');

const criteriaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  maxScore: { type: Number, required: true, min: 1 }
}, { _id: false });

const hackathonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    theme: { type: String, trim: true },
    mode: { type: String, enum: ['online', 'offline', 'hybrid'], required: true },
    venue: { type: String }, // Optional if online
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    registrationDeadline: { type: Date, required: true },
    submissionDeadline: { type: Date, required: true }, // Newly added per rules
    banner: {
      url: String,
      publicId: String,
    },
    prizePool: { type: Number, default: 0, min: 0 },
    maxTeamSize: { type: Number, default: 4, min: 1 },
    participantCount: { type: Number, default: 0 },
    rules: { type: String },
    judgingCriteria: [criteriaSchema],
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    registrationStatus: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open',
    },
    status: {
      type: String,
      enum: ['draft', 'upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'draft',
    },
    resultsPublished: { type: Boolean, default: false },
    publishedAt: Date,
  },
  { timestamps: true }
);

// Search Indexes
hackathonSchema.index({ title: 'text', theme: 'text', description: 'text' });
hackathonSchema.index({ status: 1 });
hackathonSchema.index({ organizer: 1 });
hackathonSchema.index({ startDate: 1 });
hackathonSchema.index({ registrationDeadline: 1 });

const Hackathon = mongoose.model('Hackathon', hackathonSchema);
module.exports = Hackathon;
