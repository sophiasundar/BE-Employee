const Task = require('../Models/TaskModel');
const Employee = require('../Models/EmployeeModel');


   //Create a New Task:

   exports.createTask = async (req, res) => {
     const { title, description, status, assignedTo, deadline, project } = req.body;
   
     try {
       const newTask = new Task({
         title,
         description,
         status,
         assignedTo,
         deadline,
         project,
       });
   
       await newTask.save();
       res.status(201).json({ message: 'Task created successfully', task: newTask });
     } catch (error) {
       res.status(500).json({ message: 'Server error', error: error.message });
     }
   };
   
//Assign Task to Employee

exports.assignTaskToEmployee = async (req, res) => {
    const { taskId, employeeId } = req.body;
  
    try {
      // Find the task by ID
      const task = await Task.findById(taskId);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
  
      // Assign the task to the employee (set the assignedTo field to employeeId)
      task.assignedTo = employeeId;
      task.status = 'In Progress';  // Optionally, change status when task is assigned
  
      await task.save();

        // Update the employee's tasksAssigned array
        await Employee.findByIdAndUpdate(employeeId, { $push: { tasksAssigned: taskId } });
        const updatedEmployee = await Employee.findById(employeeId);
        console.log(updatedEmployee.tasksAssigned); // Should show the task ID
        

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

    const tasks = await Task.find(filter)
      .populate({
        path: 'assignedTo', // Populate the assignedTo field (Employee)
        populate: { path: 'user', select: 'name' } // Populate the user's name from the Employee model
      });

    tasks.forEach(task => {
      console.log(task.assignedTo && task.assignedTo.user ? task.assignedTo.user.name : 'No assigned user');
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
  
      // Update status if not already "Done"
      if (status === 'Done' && task.status !== 'Done') {
        // Find the employee associated with the task
        const employee = await Employee.findOne({ tasksAssigned: taskId });
        if (employee) {
          employee.performanceMetrics.tasksCompleted += 1;
          await employee.save();
        }
      }
  
      // Allow only status update for employees
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
exports.approveOrRejectTask = async (req, res) => {
  const { taskId } = req.params;
  const { approvalStatus } = req.body;
  const adminId = req.user._id; // `req.user` contains authenticated admin info

  try {
    // Find the task by ID
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Update the task's approval status and reviewer
    task.approvalStatus = approvalStatus;
    task.reviewedBy = adminId;
    task.updatedAt = Date.now();

    await task.save();
    res.status(200).json({ message: `Task ${approvalStatus.toLowerCase()} successfully`, task });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
