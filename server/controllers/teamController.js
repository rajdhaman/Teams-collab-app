const Team = require("../models/Team");
const User = require("../models/Users");

/**
 * Get all members of a team
 * GET /api/teams/members
 */
exports.getTeamMembers = async (req, res) => {
  try {
    const { teamId } = req;

    const team = await Team.findById(teamId).populate(
      "members.userId",
      "_id name email role"
    );

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    // Return members with their info
    const members = team.members.map((member) => ({
      _id: member.userId._id,
      name: member.userId.name,
      email: member.userId.email,
      role: member.role,
      joinedAt: member.joinedAt,
    }));

    return res.status(200).json({
      success: true,
      data: members,
    });
  } catch (error) {
    console.error("Get team members error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch team members",
    });
  }
};

/**
 * Get team information
 * GET /api/teams/
 */
exports.getTeam = async (req, res) => {
  try {
    const { teamId } = req;

    const team = await Team.findById(teamId).populate("adminId", "name email");

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        _id: team._id,
        name: team.name,
        description: team.description,
        adminId: team.adminId,
        memberCount: team.members.length,
        isActive: team.isActive,
        createdAt: team.createdAt,
        updatedAt: team.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get team error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch team",
    });
  }
};

/**
 * Add a member to the team (Admin only)
 * POST /api/teams/members
 */
exports.addTeamMember = async (req, res) => {
  try {
    const { teamId } = req;
    const { userId, role } = req.body;

    if (!userId || !role) {
      return res
        .status(400)
        .json({ success: false, message: "userId and role are required" });
    }

    const team = await Team.findById(teamId);
    if (!team)
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });

    // ensure user exists
    const user = await User.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    // check if already member
    const exists = team.members.some(
      (m) => m.userId.toString() === userId.toString()
    );
    if (exists)
      return res
        .status(400)
        .json({ success: false, message: "User already a member" });

    team.members.push({ userId, role, joinedAt: new Date() });
    await team.save();

    // update user record to link to this team
    user.teamId = team._id;
    user.role = role;
    await user.save();

    return res.status(201).json({ success: true, message: "Member added" });
  } catch (error) {
    console.error("Add team member error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to add member" });
  }
};

/**
 * Update a member's role (Admin only)
 * PUT /api/teams/members/:memberId
 */
exports.updateMemberRole = async (req, res) => {
  try {
    const { teamId } = req;
    const { role } = req.body;
    const { memberId } = req.params;

    if (!role)
      return res
        .status(400)
        .json({ success: false, message: "Role is required" });

    const team = await Team.findById(teamId);
    if (!team)
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });

    const member = team.members.find(
      (m) => m.userId.toString() === memberId.toString()
    );
    if (!member)
      return res
        .status(404)
        .json({ success: false, message: "Member not found" });

    member.role = role;
    await team.save();

    // update user role in users collection
    const memberUser = await User.findById(memberId);
    if (memberUser) {
      memberUser.role = role;
      memberUser.teamId = team._id;
      await memberUser.save();
    }

    return res
      .status(200)
      .json({ success: true, message: "Member role updated" });
  } catch (error) {
    console.error("Update member role error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update member role" });
  }
};

/**
 * Remove a member from the team (Admin only)
 * DELETE /api/teams/members/:memberId
 */
exports.removeTeamMember = async (req, res) => {
  try {
    const { teamId } = req;
    const { memberId } = req.params;

    const team = await Team.findById(teamId);
    if (!team)
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });

    const idx = team.members.findIndex(
      (m) => m.userId.toString() === memberId.toString()
    );
    if (idx === -1)
      return res
        .status(404)
        .json({ success: false, message: "Member not found" });

    // prevent removing admin (optional)
    if (team.members[idx].role === "ADMIN") {
      return res
        .status(400)
        .json({ success: false, message: "Cannot remove team admin" });
    }

    const removed = team.members.splice(idx, 1)[0];
    await team.save();

    // update user record to remove team link
    const removedUser = await User.findById(memberId);
    if (removedUser) {
      removedUser.teamId = null;
      // set role to MEMBER by default when removed
      removedUser.role = "MEMBER";
      await removedUser.save();
    }

    return res.status(200).json({ success: true, message: "Member removed" });
  } catch (error) {
    console.error("Remove member error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to remove member" });
  }
};
