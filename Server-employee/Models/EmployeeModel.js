const mongoose = require('mongoose');

// Employee Schema
const employeeSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  position: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  tasksAssigned: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
    },
  ],
  timeLogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TimeLog',
    },
  ],
  performanceMetrics: {
    tasksCompleted: { type: Number, default: 0 },
    totalHoursWorked: { type: Number, default: 0 },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
});

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
