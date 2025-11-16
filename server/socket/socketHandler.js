const Message = require("../models/Message");
const User = require("../models/Users");

const setupSocketIO = (io) => {
  // Track connected users by teamId
  const teamRooms = {}; // { teamId: [socketId, ...] }

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // JOIN team room (emit from client after login)
    socket.on("join-team", async (data) => {
      try {
        if (!data || !data.teamId || !data.userId) {
          console.warn("Invalid join-team data:", data);
          return;
        }

        const { teamId, userId } = data;
        const roomName = `team-${teamId}`;

        socket.join(roomName);

        if (!teamRooms[teamId]) {
          teamRooms[teamId] = [];
        }
        if (!teamRooms[teamId].includes(socket.id)) {
          teamRooms[teamId].push(socket.id);
        }

        // Notify team that user joined
        const user = await User.findById(userId).select("name email");
        io.to(roomName).emit("user-joined", {
          userId,
          name: user?.name,
          timestamp: new Date(),
        });

        console.log(`User ${userId} joined team ${teamId}`);
      } catch (error) {
        console.error("Join team error:", error);
      }
    });

    // SEND MESSAGE (broadcast to team)
    socket.on("send-message", async (data) => {
      try {
        if (!data || !data.teamId || !data.senderId || !data.content) {
          console.warn("Invalid send-message data:", data);
          return;
        }

        const { teamId, content, senderId } = data;
        const roomName = `team-${teamId}`;

        // Save to DB
        const message = new Message({
          content,
          senderId,
          teamId,
          messageType: "TEXT",
        });
        await message.save();
        await message.populate("senderId", "name email profilePicture");

        // Broadcast to all in team room
        io.to(roomName).emit("message-received", {
          _id: message._id,
          content: message.content,
          senderId: message.senderId,
          teamId: message.teamId,
          createdAt: message.createdAt,
          messageType: message.messageType,
        });
      } catch (error) {
        console.error("Send message error:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // TASK UPDATE (broadcast to team)
    socket.on("task-updated", (data) => {
      try {
        if (!data || !data.teamId || !data.task) {
          console.warn("Invalid task-updated data:", data);
          return;
        }

        const { teamId, task } = data;
        const roomName = `team-${teamId}`;

        io.to(roomName).emit("task-changed", {
          taskId: task._id,
          task,
          updatedAt: new Date(),
        });

        console.log(`Task ${task._id} updated in team ${teamId}`);
      } catch (error) {
        console.error("Task update error:", error);
      }
    });

    // TASK DELETED (broadcast to team)
    socket.on("task-deleted", (data) => {
      try {
        if (!data || !data.teamId || !data.taskId) {
          console.warn("Invalid task-deleted data:", data);
          return;
        }

        const { teamId, taskId } = data;
        const roomName = `team-${teamId}`;

        io.to(roomName).emit("task-removed", {
          taskId,
          deletedAt: new Date(),
        });

        console.log(`Task ${taskId} deleted from team ${teamId}`);
      } catch (error) {
        console.error("Task delete error:", error);
      }
    });

    // TYPING INDICATOR
    socket.on("typing", (data) => {
      try {
        if (!data || !data.teamId || !data.userId) {
          console.warn("Invalid typing data:", data);
          return;
        }

        const { teamId, userId, userName } = data;
        const roomName = `team-${teamId}`;

        // Broadcast to others in room (exclude sender)
        socket.to(roomName).emit("user-typing", {
          userId,
          userName,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Typing indicator error:", error);
      }
    });

    // STOP TYPING
    socket.on("stop-typing", (data) => {
      try {
        if (!data || !data.teamId || !data.userId) {
          console.warn("Invalid stop-typing data:", data);
          return;
        }

        const { teamId, userId } = data;
        const roomName = `team-${teamId}`;

        socket.to(roomName).emit("user-stopped-typing", {
          userId,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Stop typing error:", error);
      }
    });

    // LEAVE TEAM
    socket.on("leave-team", (data) => {
      try {
        if (!data || !data.teamId || !data.userId) {
          console.warn("Invalid leave-team data:", data);
          return;
        }

        const { teamId, userId } = data;
        const roomName = `team-${teamId}`;

        socket.leave(roomName);

        if (teamRooms[teamId]) {
          teamRooms[teamId] = teamRooms[teamId].filter(
            (id) => id !== socket.id
          );
        }

        io.to(roomName).emit("user-left", {
          userId,
          timestamp: new Date(),
        });

        console.log(`User ${userId} left team ${teamId}`);
      } catch (error) {
        console.error("Leave team error:", error);
      }
    });

    // DISCONNECT
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);

      // Clean up from all rooms
      Object.keys(teamRooms).forEach((teamId) => {
        teamRooms[teamId] = teamRooms[teamId].filter((id) => id !== socket.id);
      });
    });

    // ERROR HANDLER
    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  });
};

module.exports = setupSocketIO;
