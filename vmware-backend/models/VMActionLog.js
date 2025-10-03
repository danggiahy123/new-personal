const mongoose = require('mongoose');

const vmActionLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['start', 'stop', 'restart', 'login', 'logout']
  },
  vmId: {
    type: String,
    required: function() {
      return ['start', 'stop', 'restart'].includes(this.action);
    }
  },
  vmName: {
    type: String,
    required: function() {
      return ['start', 'stop', 'restart'].includes(this.action);
    }
  },
  esxiHost: {
    type: String,
    required: true
  },
  success: {
    type: Boolean,
    required: true,
    default: true
  },
  errorMessage: {
    type: String
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
vmActionLogSchema.index({ user: 1, timestamp: -1 });
vmActionLogSchema.index({ action: 1, timestamp: -1 });
vmActionLogSchema.index({ vmId: 1, timestamp: -1 });

// Virtual for formatted timestamp
vmActionLogSchema.virtual('formattedTimestamp').get(function() {
  return this.timestamp.toLocaleString();
});

// Ensure virtual fields are serialized
vmActionLogSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('VMActionLog', vmActionLogSchema);
