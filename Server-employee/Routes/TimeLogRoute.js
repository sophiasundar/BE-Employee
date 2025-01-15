const express = require('express');
const router = express.Router();
const { authenticate } = require('../Middleware/Authentication');
const roleMiddleware = require('../Middleware/Role');
const {
  createTimeLog,
  updateTimeLog,
  getTimeLogs,
  getAllTimeLogs,
} = require('../Controllers/TimeLogController');

// Create a new time log (Employee only)
router.post('/create', authenticate, roleMiddleware('employee'), createTimeLog);

// Update a time log with end time (Employee only)
router.put('/update/:id', authenticate, roleMiddleware('employee'), updateTimeLog);

// Get time logs for the logged-in user (Employee or Admin)
router.get('/user', authenticate, getTimeLogs);

// Get all time logs (Admin only)
router.get('/all', authenticate, roleMiddleware('admin'), getAllTimeLogs);




module.exports = router;
