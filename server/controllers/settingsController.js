const User = require("../models/Users");
const Team = require("../models/Team");

const settingsController = {
  // GET user settings
  getUserSettings: async (req, res) => {
    try {
      const { userId } = req;

      const user = await User.findById(userId).select(
        "name email profilePicture notifications"
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture,
          notifications: user.notifications || {
            emailNotifications: true,
            taskAssignmentNotifications: true,
          },
        },
      });
    } catch (error) {
      console.error("Get user settings error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch user settings",
      });
    }
  },

  // UPDATE user settings
  updateUserSettings: async (req, res) => {
    try {
      const { userId } = req;
      const { name, notifications } = req.validatedBody;

      const updates = {};
      if (name) updates.name = name;
      if (notifications) updates.notifications = notifications;

      const user = await User.findByIdAndUpdate(userId, updates, {
        new: true,
      }).select("name email profilePicture notifications");

      return res.status(200).json({
        success: true,
        data: {
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture,
          notifications: user.notifications,
        },
      });
    } catch (error) {
      console.error("Update user settings error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update user settings",
      });
    }
  },

  // DELETE user account
  deleteUserAccount: async (req, res) => {
    try {
      const { userId } = req;

      // Find user and remove from team
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Remove from team members if part of a team
      if (user.teamId) {
        await Team.findByIdAndUpdate(user.teamId, {
          $pull: { members: { userId } },
        });
      }

      // Delete user
      await User.findByIdAndDelete(userId);

      return res.status(200).json({
        success: true,
        message: "Account deleted successfully",
      });
    } catch (error) {
      console.error("Delete account error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete account",
      });
    }
  },

  // GET team settings
  getTeamSettings: async (req, res) => {
    try {
      const { teamId } = req;

      const team = await Team.findById(teamId).select(
        "name description isActive createdAt"
      );

      if (!team) {
        return res.status(404).json({
          success: false,
          message: "Team not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          name: team.name,
          description: team.description,
        },
      });
    } catch (error) {
      console.error("Get team settings error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch team settings",
      });
    }
  },

  // UPDATE team settings
  updateTeamSettings: async (req, res) => {
    try {
      const { teamId, userRole } = req;

      // Only ADMIN can update team settings
      if (userRole !== "ADMIN") {
        return res.status(403).json({
          success: false,
          message: "Only team admins can update team settings",
        });
      }

      const { name, description } = req.validatedBody;

      const updates = {};
      if (name) updates.name = name;
      if (description !== undefined) updates.description = description;

      const team = await Team.findByIdAndUpdate(teamId, updates, {
        new: true,
      }).select("name description");

      return res.status(200).json({
        success: true,
        data: {
          name: team.name,
          description: team.description,
        },
      });
    } catch (error) {
      console.error("Update team settings error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update team settings",
      });
    }
  },
};

module.exports = settingsController;
