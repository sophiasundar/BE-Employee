const Employee = require('../Models/EmployeeModel');
const User = require('../Models/UserModel')
// const Task = require('../Models/TaskModel');
// const TimeLog = require('../Models/TimeModel');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

// Get all employees records (Admin only)
exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
    .populate('user', 'name email')
    .populate('tasksAssigned')
      .populate('timeLogs');
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get an employee's record (Admin or Employee)

exports.getEmployeeDetails = async (req, res) => {
  try {
    // Find the employee by the user ID from the User model
    const employee = await Employee.findOne({ user: req.params.userId })
      .populate('user', 'name email')
      .populate('tasksAssigned')
      .populate('timeLogs');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Ensure the current user is either the admin or the employee themselves
    if (req.user.role === 'admin' || req.user._id.toString() === employee.user._id.toString()) {
      res.status(200).json(employee);
    } else {
      return res.status(403).json({ message: 'Access Denied' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// Create a new employee (Admin only)
// Configure the email transport
const transporter = nodemailer.createTransport({
    service: 'Gmail', 
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS, 
    },
  });
  
  exports.createEmployee = async (req, res) => {
    const { name, email, position, department } = req.body;
  
    try {
      // Check if the email already exists in the User collection
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }
    
      // Generate a random password
      const randomPassword = Math.random().toString(36).slice(-8);
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
  
      // Create a new user
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        role: 'employee',
      });
  
      const createdUser = await newUser.save();
  
      // Create a new employee linked to the user
      const newEmployee = new Employee({
        user: createdUser._id,
        position,
        department,
      });
  
      const createdEmployee = await newEmployee.save();
  
      // Update the User with the employeeId
      createdUser.employee = createdEmployee._id;
      await createdUser.save();
  
      // Email options
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Welcome to Our Company',
        text: `Hello ${name},\n\nYour account has been created. Your password is: ${randomPassword}\n\nPlease change your password after logging in.\n\nThank you.`,
      };
  
      // Send the email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.status(500).json({ message: 'Error sending email', error: error.message });
        }
        res.status(201).json({ message: 'Employee created successfully', employee: createdEmployee });
      });
  
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

// Update an employee (Admin only)
exports.updateEmployee = async (req, res) => {
  const { id } = req.params;
  const { position, department } = req.body;

  try {
    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      { position, department, updatedAt: Date.now() },
      { new: true }
    ).populate('user', 'name email');

    if (!updatedEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.status(200).json({ message: 'Employee updated successfully', employee: updatedEmployee });
  } catch (error) {
      // Check if the employee already exists by email
      if (error.code === 11000) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete an employee (Admin only)
exports.deleteEmployee = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedEmployee = await Employee.findByIdAndDelete(id);

    if (!deletedEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



