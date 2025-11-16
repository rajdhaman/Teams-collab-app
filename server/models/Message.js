const mongoose = require("mongoose");
const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
      index: true,
    },
    messageType: {
      type: String,
      enum: ["TEXT", "SYSTEM", "NOTIFICATION"],
      default: "TEXT",
    },
    readBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);
messageSchema.index({ teamId: 1, createdAt: -1 });
module.exports = mongoose.model("Message", messageSchema);
