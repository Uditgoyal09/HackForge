const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true, // System actions can use a designated system Admin user ID
    },
    action: {
      type: String,
      required: true,
    },
    entityType: {
      type: String,
      required: true, // e.g. 'Hackathon', 'Team', 'User'
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    description: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ entityType: 1, entityId: 1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
module.exports = ActivityLog;
