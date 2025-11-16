const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/auth");
const validate = require("../middlewares/validation");
const messageValidators = require("../validators/messageValidators");
const messageController = require("../controllers/messageController");

// All message routes require authentication
router.use(authenticate);

// GET messages (with pagination)
router.get("/", messageController.getMessages);

// SEND message
router.post(
  "/",
  validate(messageValidators.send),
  messageController.sendMessage
);

// DELETE message
router.delete("/:id", messageController.deleteMessage);

// MARK message as read
router.put("/:id/read", messageController.markAsRead);

module.exports = router;
