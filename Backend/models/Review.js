import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  judge: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  submission: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Submission',
    required: true
  },
  scores: [{
    criterion: { type: String, required: true },
    score: { type: Number, required: true, min: 0, max: 10 }
  }],
  comments: { type: String },
  totalScore: { type: Number, default: 0 }
}, { timestamps: true });

// Pre-save hook to automatically calculate the total score
reviewSchema.pre('save', function(next) {
  if (this.scores && this.scores.length > 0) {
    this.totalScore = this.scores.reduce((acc, curr) => acc + curr.score, 0);
  }
  next();
});

export default mongoose.model('Review', reviewSchema);
