const express = require('express');
const router = express.Router();
const { authenticate } = require('../Middleware/Authentication');
const roleMiddleware = require('../Middleware/Role');
const {
  createTask,
  assignTaskToEmployee,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask
} = require('../Controllers/TaskController');

// Task Management Routes

// Create a new task (Admin only)  
router.post('/create', authenticate, roleMiddleware('admin'), createTask);

// Assign task to an employee (Admin only)  
router.put('/assign', authenticate, roleMiddleware('admin'), assignTaskToEmployee);

// Get all tasks (Admin only)  
router.get('/', authenticate, roleMiddleware('admin'), getAllTasks);

// Get a task by ID (Admin or Employee)
router.get('/:taskId', authenticate, getTaskById);


// Update a task (Admin only)
router.put('/:taskId', authenticate, roleMiddleware('admin'), updateTask);

// Delete a task (Admin only)
router.delete('/:taskId', authenticate, roleMiddleware('admin'), deleteTask);

module.exports = router;


