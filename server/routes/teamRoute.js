const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/auth");
const roleCheck = require("../middlewares/roleCheck");
const teamController = require("../controllers/teamController");

// All team routes require authentication
router.use(authenticate);

// GET team members
router.get("/members", teamController.getTeamMembers);

// GET team info
router.get("/", teamController.getTeam);

// ADMIN: Add a member to the team
router.post("/members", roleCheck("ADMIN"), teamController.addTeamMember);

// ADMIN: Update a member's role
router.put(
  "/members/:memberId",
  roleCheck("ADMIN"),
  teamController.updateMemberRole
);

// ADMIN: Remove a member from the team
router.delete(
  "/members/:memberId",
  roleCheck("ADMIN"),
  teamController.removeTeamMember
);

module.exports = router;
