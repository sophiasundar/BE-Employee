const Task = require('../Models/TaskModel');
const Employee = require('../Models/EmployeeModel')


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

  exports.getAllTasks = async (req, res) => {
    try {
      const tasks = await Task.find();
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
  

  
  //update task 

  exports.updateTask = async (req, res) => {
    const { taskId } = req.params;
    const { title, description, status, deadline, project } = req.body;
  
    try {
      // Find the task by ID
      const task = await Task.findById(taskId);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
  
      // Update the task with the provided data
      task.title = title || task.title;
      task.description = description || task.description;
      task.status = status || task.status;
      task.deadline = deadline || task.deadline;
      task.project = project || task.project;
      task.updatedAt = Date.now();  
  
      await task.save();
      res.status(200).json({ message: 'Task updated successfully', task });
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
  