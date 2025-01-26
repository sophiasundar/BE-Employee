const Task = require('../Models/TaskModel');
const Employee = require('../Models/EmployeeModel');
const User = require('../Models/UserModel');
const nodemailer = require('nodemailer');

   //Create a New Task: assigned to is not needed

   exports.createTask = async (req, res) => {
    const { title, description, status, deadline, project, employeeEmail } = req.body;
  
    try {
      // Ensure the employeeEmail is provided
      if (!employeeEmail) {
        return res.status(400).json({ message: 'Employee email is required' });
      }
  
      // Find the user (employee) by email
      const user = await User.findOne({ email: employeeEmail });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Assuming the user document has a reference to the employee document
      const employee = await Employee.findOne({ _id: user.employee });
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }
  
      // Create the new task with the assignedTo field set to the employee's ID
      const newTask = new Task({
        title,
        description,
        status,
        deadline,
        project,
        assignedTo: employee._id,  // Assign the task to the employee's ID
      });
  
      await newTask.save();
  
      // Update the employee's tasksAssigned array
      await Employee.findByIdAndUpdate(employee._id, { $push: { tasksAssigned: newTask._id } });
  
      res.status(201).json({ message: 'Task created successfully', task: newTask });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  
   
//Assign Task to Employee


exports.assignTaskToEmployee = async (req, res) => {
  const { taskCode, employeeEmail } = req.body;  // Using taskCode and employeeEmail

  try {
    // Find the task by task code
    const task = await Task.findOne({ taskCode });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Find the user (employee) by email in the User model
    const user = await User.findOne({ email: employeeEmail });
    console.log('User:', user); 

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    //the user has a reference to the employee record
    const employee = await Employee.findOne({ _id: user.employee });
    console.log('Employee:', employee); 

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Assign the task to the employee (set the assignedTo field to employee's ID)
    task.assignedTo = employee._id;
    task.status = 'In Progress';  // Optionally, change status when task is assigned

    await task.save();

    // Update the employee's tasksAssigned array
    await Employee.findByIdAndUpdate(employee._id, { $push: { tasksAssigned: task._id } });

    // Email integration: Send email notification to the employee
    const transporter = nodemailer.createTransport({
      service: 'Gmail', 
      auth: {
        user:  process.env.EMAIL_USER, 
        pass:    process.env.EMAIL_PASS, 
      }
    });

    const mailOptions = {
      from: 'your-email@gmail.com',
      to: employeeEmail,
      subject: 'New Task Assigned',
      text: `Hello ${user.name},\n\nYou have been assigned a new task.\n\nTask Title: ${task.title}\nTask Description: ${task.description}\nDeadline: ${task.deadline}\n\nPlease log in to your account to view more details.\n\nBest regards,\nYour Company`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    res.status(200).json({ message: 'Task assigned to employee successfully', task });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};




  //get all task

 // Get all tasks with optional filtering by status

 exports.getAllTasks = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) {
      filter.status = status;
    }

    // Fetch all tasks, including necessary fields and populate references
    const tasks = await Task.find(filter)
      .select('taskCode title description status deadline project approvalStatus reviewedBy createdAt updatedAt')  // Include all required fields
      .populate({
        path: 'assignedTo',
        select: 'user', // If you need employee details, modify as needed
        populate: { path: 'user', select: 'name email' } // Populate the user's details from Employee model
      })
      .populate({
        path: 'reviewedBy', // Populate reviewedBy with User data
        select: 'name email'  // Populate only the name and email of the reviewer (admin)
      });

    // Log task information to check populated data
    tasks.forEach(task => {
      console.log(`Task Code: ${task.taskCode}, Assigned To: ${task.assignedTo ? task.assignedTo.user.name : 'No Assigned User'}`);
    });

    res.status(200).json({ tasks });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};






  //get task by Id

  exports.getTaskById = async (req, res) => {
    const { taskId } = req.params;
  
    try {
      const task = await Task.findById(taskId);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      res.status(200).json({ task });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  

  
  //update task for employee

  exports.updateTaskStatus = async (req, res) => {
    const { taskId } = req.params;
    const { status } = req.body;
  
    try {
      // Find the task by ID
      const task = await Task.findById(taskId);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
  
      // Check if the status is being changed to "Done"
      if (status === 'Done' && task.status !== 'Done') {
        // Find the employee associated with the task
        const employee = await Employee.findOne({ tasksAssigned: taskId });
        if (employee) {
          // Increment the tasksCompleted only if it's not already marked as "Done"
          employee.performanceMetrics.tasksCompleted += 1;
          await employee.save();
        }
      }
  
      // Allow status update (without incrementing task completion count)
      task.status = status || task.status;
      task.updatedAt = Date.now();
  
      await task.save();
      res.status(200).json({ message: 'Task status updated successfully', task });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  
  
  
  

  //updateTask by admin

  exports.updateTask = async (req, res) => {
    const { taskId } = req.params;
  const { title, description, deadline, project } = req.body;

  try {
    // Find the task by ID
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Allow only admin to update title, description, deadline, and project
    task.title = title || task.title;
    task.description = description || task.description;
    task.deadline = deadline || task.deadline;
    task.project = project || task.project;
    task.updatedAt = Date.now();  

    await task.save();
    res.status(200).json({ message: 'Task details updated successfully', task });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
  };
  


  //delete task 
  exports.deleteTask = async (req, res) => {
    const { taskId } = req.params;
  
    try {
      // Find and delete the task by ID
      const task = await Task.findByIdAndDelete(taskId);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
  
      res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };



// Approve or reject a task by Admin

// Approve or Reject Task
exports.approveOrRejectTask = async (req, res) => {
  const { id } = req.params;
  const { approvalStatus } = req.body;

  if (!['Approved', 'Rejected'].includes(approvalStatus)) {
    return res.status(400).json({ message: 'Invalid approval status' });
  }

  try {
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check the current date and task deadline
    const currentDate = new Date();
    const deadline = new Date(task.deadline);

    // If the task status is "To-Do," ensure it is assigned to an employee
    if (task.status === 'To-Do' && !task.assignedTo) {
      return res.status(400).json({
        message: 'Task is in "To-Do" status and must be assigned to an employee before approval or rejection.',
      });
    }

    if (approvalStatus === 'Approved') {
      // Only approve if task is completed (status: Done) and before the deadline
      if (task.status !== 'Done') {
        return res.status(400).json({ message: 'Task must be completed (status: Done) to approve.' });
      }
      if (deadline < currentDate) {
        return res.status(400).json({ message: 'Cannot approve a task past its deadline.' });
      }
    } else if (approvalStatus === 'Rejected') {
      // Reject if the task is still in progress or incomplete
      if (task.status === 'In Progress' || task.status === 'To-Do' || task.status !== 'Done') {
        return res.status(400).json({
          message: 'Task must be completed (status: Done) to approve. Rejecting as it is not yet completed.',
        });
      }
    }

    // Update task approval status
    task.approvalStatus = approvalStatus;
    task.reviewedBy = req.user.id; // Extract adminId from the verified token
    task.updatedAt = Date.now();

    await task.save();
    return res.status(200).json({ message: `Task ${approvalStatus.toLowerCase()} successfully.`, task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};




