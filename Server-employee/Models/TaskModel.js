const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['To-Do', 'In Progress', 'Done'],
    default: 'To-Do',
  },
 assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee', 
  },
  taskCode: { 
    type: String, 
    unique: true 
  }, 
  deadline: {
    type: Date,
  },
  project: {
    type: String,
    trim: true,
  },
  approvalStatus: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Admin who reviewed the task
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
});

taskSchema.pre('save', function (next) {
  if (this.isNew) {
    // Generate task code by concatenating task name and timestamp or unique number
    this.taskCode = `${this.title.replace(/\s+/g, '-').toUpperCase()}-${Date.now()}`;
  }
  next();
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;

