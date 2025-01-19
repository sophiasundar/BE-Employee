const express = require('express');
const router = express.Router();
const { authenticate } = require('../Middleware/Authentication');
const roleMiddleware = require('../Middleware/Role');
const {
  getEmployees,getEmployeeDetails,createEmployee,updateEmployee,
  deleteEmployee,
} = require('../Controllers/EmployeeController');

// Employee Management Routes

// Get all employees (Admin only) 
router.get('/employees', authenticate, roleMiddleware('admin'), getEmployees); 

// Get an employee's record (Admin or Employee) 
router.get('/employees/:userId', authenticate, getEmployeeDetails);

// Create a new employee (Admin only) 
router.post('/employees', authenticate, roleMiddleware('admin'), createEmployee); 

 // Update an employee (Admin only) 
router.put('/employees/:id', authenticate, roleMiddleware('admin'), updateEmployee);

// Delete an employee (Admin only)
router.delete('/employees/:id', authenticate, roleMiddleware('admin'), deleteEmployee); 





module.exports = router;

