const TimeLog = require('../Models/TimeModel');
const Employee = require('../Models/EmployeeModel');
const Task = require('../Models/TaskModel')

// Create a new time log entry
exports.createTimeLog = async (req, res) => {
  try {
    const { taskCode, startTime } = req.body; 
    const userId = req.user._id; //  user is authenticated and we can access user ID from req.user

    if (!userId) {
      return res.status(400).json({ message: 'User not authenticated' });
    }

    // Ensure task exists by taskCode
    const task = await Task.findOne({ taskCode });
    if (!task) {
      return res.status(404).json({ message: 'Task with the provided task code not found' });
    }

    // Create a new time log entry
    const newTimeLog = new TimeLog({
      task: task._id, // Store the ObjectId of the found task
      user: userId,
      startTime,
    });

    await newTimeLog.save();

    // Update employee's time logs and total hours worked
    const employee = await Employee.findOne({ user: userId });
    if (employee) {
      employee.timeLogs.push(newTimeLog._id);
      employee.performanceMetrics.totalHoursWorked += newTimeLog.duration; // Assuming duration is calculated
      await employee.save();
    }

    res.status(201).json({ message: 'Time log created successfully', timeLog: newTimeLog });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create time log', error });
  }
};



// Update a time log entry with end time
exports.updateTimeLog = async (req, res) => {
  try {
    const { id } = req.params;
    const { endTime } = req.body;

    const timeLog = await TimeLog.findById(id);
    if (!timeLog) {
      return res.status(404).json({ message: 'Time log not found' });
    }

    timeLog.endTime = endTime;
    timeLog.duration = (new Date(endTime) - new Date(timeLog.startTime)) / (1000 * 60 * 60); // Duration in hours
    await timeLog.save();

    // Update total hours worked for the employee
    const employee = await Employee.findOne({ user: timeLog.user });
    if (employee) {
      employee.performanceMetrics.totalHoursWorked += timeLog.duration;
      await employee.save();
    }

    res.status(200).json({ message: 'Time log updated successfully', timeLog });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update time log', error });
  }
};


// Get time logs for a user (Employee or Admin can view)
exports.getTimeLogs = async (req, res) => {
  try {
    const userId = req.user._id;
    const timeLogs = await TimeLog.find({ user: userId }).populate('task');

    res.status(200).json({ timeLogs });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch time logs', error });
  }
};

// Get all time logs (Admin only)
exports.getAllTimeLogs = async (req, res) => {
  try {
    const timeLogs = await TimeLog.find()
    .populate('task') 
      .populate({
        path: 'user',
        select: 'name email role -_id', 
      });

    res.status(200).json({ timeLogs });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch all time logs', error });
  }
};

