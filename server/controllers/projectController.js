const Project = require("../models/Project");
const Task = require("../models/Task");
const User = require("../models/Users");

const projectController = {
  // GET all projects for a team
  getAllProjects: async (req, res) => {
    try {
      const { teamId } = req;
      const projects = await Project.find({ teamId })
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        data: projects,
      });
    } catch (error) {
      console.error("Get projects error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch projects",
      });
    }
  },

  // CREATE a new project
  createProject: async (req, res) => {
    try {
      const { name, description } = req.validatedBody;
      const { teamId, userId } = req;

      const project = new Project({
        name,
        description,
        teamId,
        createdBy: userId,
        status: "ACTIVE",
      });

      await project.save();
      await project.populate("createdBy", "name email");

      return res.status(201).json({
        success: true,
        message: "Project created successfully",
        data: project,
      });
    } catch (error) {
      console.error("Create project error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create project",
      });
    }
  },

  // GET project by ID
  getProjectById: async (req, res) => {
    try {
      const { id } = req.params;
      const { teamId } = req;

      const project = await Project.findOne({ _id: id, teamId }).populate(
        "createdBy",
        "name email"
      );

      if (!project) {
        return res.status(404).json({
          success: false,
          message: "Project not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: project,
      });
    } catch (error) {
      console.error("Get project error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch project",
      });
    }
  },

  // UPDATE a project
  updateProject: async (req, res) => {
    try {
      const { id } = req.params;
      const { teamId } = req;
      const updates = req.validatedBody;

      const project = await Project.findOneAndUpdate(
        { _id: id, teamId },
        updates,
        { new: true }
      ).populate("createdBy", "name email");

      if (!project) {
        return res.status(404).json({
          success: false,
          message: "Project not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Project updated",
        data: project,
      });
    } catch (error) {
      console.error("Update project error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update project",
      });
    }
  },

  // DELETE a project (and its tasks)
  deleteProject: async (req, res) => {
    try {
      const { id } = req.params;
      const { teamId } = req;

      const project = await Project.findOneAndDelete({ _id: id, teamId });

      if (!project) {
        return res.status(404).json({
          success: false,
          message: "Project not found",
        });
      }

      // Delete all tasks in this project
      await Task.deleteMany({ projectId: id });

      return res.status(200).json({
        success: true,
        message: "Project deleted successfully",
      });
    } catch (error) {
      console.error("Delete project error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete project",
      });
    }
  },
};

module.exports = projectController;
