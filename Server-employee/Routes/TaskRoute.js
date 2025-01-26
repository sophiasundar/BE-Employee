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
  updateTaskStatus,
  deleteTask,
  approveOrRejectTask
} = require('../Controllers/TaskController');

// Task Management Routes

// Create a new task (Admin only)  
router.post('/create', authenticate, roleMiddleware('admin'), createTask);

// Assign task to an employee (Admin only)  ✔️
router.put('/assign', authenticate, roleMiddleware('admin'), assignTaskToEmployee);

// Get all tasks (Admin only)  ✔️
router.get('/', authenticate, roleMiddleware('admin'), getAllTasks);

// Get a task by ID (Admin or Employee)
router.get('/:taskId', authenticate, roleMiddleware('employee'), getTaskById);


// Update a task (Admin only) ✔️
router.put('/:taskId', authenticate, roleMiddleware('admin'), updateTask);

//Update a task (Employee only)✔️
router.put('/status/:taskId', authenticate, roleMiddleware('employee'), updateTaskStatus);


// Delete a task (Admin only)✔️
router.delete('/:taskId', authenticate, roleMiddleware('admin'), deleteTask);

// Approve or reject a task (Admin only)

router.put('/approve-reject/:id', authenticate, roleMiddleware('admin'), approveOrRejectTask);


module.exports = router;


