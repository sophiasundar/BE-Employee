const mongoose = require('mongoose');

const timeLogSchema = new mongoose.Schema({
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
  },
  duration: {
    type: Number,
    default: 0, // Initial duration set to 0
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware to calculate duration when endTime is set
timeLogSchema.pre('save', function (next) {
  if (this.endTime) {
    this.duration = (this.endTime - this.startTime) / (1000 * 60 * 60); // Duration in hours
  }
  next();
});

const TimeLog = mongoose.model('TimeLog', timeLogSchema);

module.exports = TimeLog;

