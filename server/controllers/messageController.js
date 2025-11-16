const Message = require("../models/Message");
const User = require("../models/Users");

const messageController = {
  // GET all messages for a team
  getMessages: async (req, res) => {
    try {
      const { teamId } = req;
      const { limit = 50, skip = 0 } = req.query;

      const messages = await Message.find({ teamId })
        .populate("senderId", "name email profilePicture")
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip));

      const total = await Message.countDocuments({ teamId });

      return res.status(200).json({
        success: true,
        data: messages.reverse(), // Return in chronological order
        total,
      });
    } catch (error) {
      console.error("Get messages error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch messages",
      });
    }
  },

  // SEND a message
  sendMessage: async (req, res) => {
    try {
      const { content, messageType } = req.validatedBody;
      const { teamId, userId } = req;

      const message = new Message({
        content,
        senderId: userId,
        teamId,
        messageType: messageType || "TEXT",
      });

      await message.save();
      await message.populate("senderId", "name email profilePicture");

      // Emit via Socket.IO in server.js (handled separately)

      return res.status(201).json({
        success: true,
        message: "Message sent",
        data: message,
      });
    } catch (error) {
      console.error("Send message error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to send message",
      });
    }
  },

  // DELETE a message (sender or admin only)
  deleteMessage: async (req, res) => {
    try {
      const { id } = req.params;
      const { userId, userRole } = req;

      const message = await Message.findById(id);
      if (!message) {
        return res.status(404).json({
          success: false,
          message: "Message not found",
        });
      }

      // Allow sender or admin to delete
      if (message.senderId.toString() !== userId && userRole !== "ADMIN") {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to delete this message",
        });
      }

      await Message.findByIdAndDelete(id);

      return res.status(200).json({
        success: true,
        message: "Message deleted",
      });
    } catch (error) {
      console.error("Delete message error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete message",
      });
    }
  },

  // MARK message as read
  markAsRead: async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req;

      const message = await Message.findByIdAndUpdate(
        id,
        {
          $addToSet: {
            readBy: { userId, readAt: new Date() },
          },
        },
        { new: true }
      ).populate("senderId", "name email profilePicture");

      return res.status(200).json({
        success: true,
        data: message,
      });
    } catch (error) {
      console.error("Mark as read error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to mark message as read",
      });
    }
  },
};

module.exports = messageController;
