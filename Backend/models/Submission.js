import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  team: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Team',
    required: true
  },
  hackathon: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Hackathon',
    required: true
  },
  project: {
    title: { type: String, required: true },
    description: { type: String, required: true },
    repoLink: { type: String },
    demoVideo: { type: String },
    liveLink: { type: String },
    techStack: [{ type: String }]
  },
  status: { 
    type: String, 
    enum: ['submitted', 'under_review', 'evaluated'], 
    default: 'submitted' 
  }
}, { timestamps: true });

export default mongoose.models.Submission || mongoose.model('Submission', submissionSchema);
