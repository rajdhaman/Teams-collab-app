const Task = require("../models/Task");
const Project = require("../models/Project");
const User = require("../models/Users");

const taskController = {
  // GET all tasks for a project or team
  getAllTasks: async (req, res) => {
    try {
      const { projectId } = req.query;
      const { teamId } = req;

      let query = {};
      if (projectId) {
        query.projectId = projectId;
      }

      const tasks = await Task.find(query)
        .populate("assignedTo", "name email profilePicture")
        .populate("createdBy", "name email")
        .populate({
          path: "projectId",
          select: "name teamId",
          match: { teamId: teamId }, // Filter by team directly in populate
        })
        .sort({ position: 1, createdAt: -1 });

      // Remove tasks where projectId is null (filtered out by match above)
      const result = tasks.filter((task) => task.projectId !== null);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Get tasks error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch tasks",
      });
    }
  },

  // CREATE a new task
  createTask: async (req, res) => {
    try {
      const { title, description, priority, dueDate, assignedTo, projectId } =
        req.validatedBody;
      const { userId, teamId } = req;

      // Verify projectId is provided
      if (!projectId) {
        return res.status(400).json({
          success: false,
          message: "Project ID is required",
        });
      }

      // Verify project exists and belongs to user's team
      const project = await Project.findOne({ _id: projectId, teamId });
      if (!project) {
        return res.status(404).json({
          success: false,
          message: "Project not found",
        });
      }

      // Get max position for ordering
      const lastTask = await Task.findOne({ projectId }).sort({ position: -1 });
      const position = (lastTask?.position || 0) + 1;

      // Only allow assigning when creator is ADMIN or MANAGER
      const canAssign = req.userRole === "ADMIN" || req.userRole === "MANAGER";

      const task = new Task({
        title,
        description,
        projectId,
        priority,
        dueDate,
        assignedTo: canAssign ? assignedTo || null : null,
        createdBy: userId,
        position,
        status: "TODO",
      });

      await task.save();
      await task.populate("assignedTo", "name email profilePicture");
      await task.populate("createdBy", "name email");
      await task.populate("projectId", "name teamId");

      return res.status(201).json({
        success: true,
        message: "Task created successfully",
        data: task,
      });
    } catch (error) {
      console.error("Create task error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create task",
      });
    }
  },

  // GET task by ID
  getTaskById: async (req, res) => {
    try {
      const { id } = req.params;
      const { teamId } = req;

      const task = await Task.findById(id)
        .populate("assignedTo", "name email profilePicture")
        .populate("createdBy", "name email")
        .populate("projectId", "name teamId");

      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }

      // Verify task belongs to user's team
      const project = await Project.findOne({
        _id: task.projectId._id,
        teamId,
      });
      if (!project) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to view this task",
        });
      }

      return res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      console.error("Get task error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch task",
      });
    }
  },

  // UPDATE a task (status, assignee, priority, etc.)
  updateTask: async (req, res) => {
    try {
      const { id } = req.params;
      const { teamId } = req;
      const updates = req.validatedBody;

      // Find task and verify it belongs to user's team
      const task = await Task.findById(id).populate("projectId");
      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }

      const project = await Project.findOne({
        _id: task.projectId._id,
        teamId,
      });
      if (!project) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to update this task",
        });
      }

      // If trying to change assignee, ensure user has permission
      if (Object.prototype.hasOwnProperty.call(updates, "assignedTo")) {
        const canAssign =
          req.userRole === "ADMIN" || req.userRole === "MANAGER";
        if (!canAssign) {
          return res.status(403).json({
            success: false,
            message: "Insufficient permissions to assign tasks",
          });
        }
      }

      const updatedTask = await Task.findByIdAndUpdate(id, updates, {
        new: true,
      })
        .populate("assignedTo", "name email profilePicture")
        .populate("createdBy", "name email")
        .populate("projectId", "name");

      return res.status(200).json({
        success: true,
        message: "Task updated",
        data: updatedTask,
      });
    } catch (error) {
      console.error("Update task error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update task",
      });
    }
  },

  // DELETE a task
  deleteTask: async (req, res) => {
    try {
      const { id } = req.params;
      const { teamId } = req;

      const userRole = req.userRole;
      const userId = req.userId;

      const task = await Task.findById(id).populate("projectId");
      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }

      const project = await Project.findOne({
        _id: task.projectId._id,
        teamId,
      });
      if (!project) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to delete this task",
        });
      }

      // Admins can delete any task in the team
      if (userRole === "ADMIN") {
        await Task.findByIdAndDelete(id);
        return res
          .status(200)
          .json({ success: true, message: "Task deleted successfully" });
      }

      // Managers and Members can only delete tasks they created
      // Need createdBy to be present on task (may be null for older tasks)
      const createdById = task.createdBy ? task.createdBy.toString() : null;
      if (createdById && createdById === userId.toString()) {
        await Task.findByIdAndDelete(id);
        return res
          .status(200)
          .json({ success: true, message: "Task deleted successfully" });
      }

      return res
        .status(403)
        .json({
          success: false,
          message: "Insufficient permissions to delete this task",
        });
    } catch (error) {
      console.error("Delete task error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete task",
      });
    }
  },
};

module.exports = taskController;
