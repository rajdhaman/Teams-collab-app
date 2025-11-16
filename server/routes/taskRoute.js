const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/auth");
const validate = require("../middlewares/validation");
const taskValidators = require("../validators/taskValidators");
const taskController = require("../controllers/taskController");

// All task routes require authentication
router.use(authenticate);

// GET all tasks (with optional projectId query)
router.get("/", taskController.getAllTasks);

// CREATE task
router.post("/", validate(taskValidators.create), taskController.createTask);

// GET task by ID
router.get("/:id", taskController.getTaskById);

// UPDATE task
router.put("/:id", validate(taskValidators.update), taskController.updateTask);

// DELETE task
router.delete("/:id", taskController.deleteTask);

module.exports = router;
