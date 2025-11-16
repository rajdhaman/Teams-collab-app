const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/auth");
const roleCheck = require("../middlewares/roleCheck");
const validate = require("../middlewares/validation");
const projectValidators = require("../validators/projectValidators");
const projectController = require("../controllers/projectController");

// All project routes require authentication
router.use(authenticate);

// GET all projects for team
router.get("/", projectController.getAllProjects);

// CREATE project (Admin/Manager only)
router.post(
  "/",
  roleCheck("ADMIN", "MANAGER"),
  validate(projectValidators.create),
  projectController.createProject
);

// GET project by ID
router.get("/:id", projectController.getProjectById);

// UPDATE project (Admin/Manager only)
router.put(
  "/:id",
  roleCheck("ADMIN", "MANAGER"),
  validate(projectValidators.update),
  projectController.updateProject
);

// DELETE project (Admin only)
router.delete("/:id", roleCheck("ADMIN"), projectController.deleteProject);

module.exports = router;
