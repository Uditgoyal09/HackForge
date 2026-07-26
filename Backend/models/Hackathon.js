import mongoose from 'mongoose';

const hackathonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  theme: { type: String },
  mode: {
    type: String,
    enum: ['online', 'offline', 'hybrid'],
    default: 'online'
  },
  venue: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  registrationDeadline: { type: Date, required: true },
  bannerImage: { type: String },
  prizePool: { type: String },
  maxTeamSize: { type: Number, default: 4 },
  rules: { type: String },
  judgingCriteria: { type: String },
  registrationOpen: { type: Boolean, default: true },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

export default mongoose.models.Hackathon || mongoose.model('Hackathon', hackathonSchema);
