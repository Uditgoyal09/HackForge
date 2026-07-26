import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
  hackathon: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Hackathon',
    required: true
  },
  participant: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  },
  team: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Team'
  },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  }
}, { timestamps: true });

export default mongoose.model('Registration', registrationSchema);
