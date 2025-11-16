const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["ADMIN", "MANAGER", "MEMBER"],
      default: "MEMBER",
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    profilePicture: String,
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    notifications: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      taskAssignmentNotifications: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);
// Compound index for performance
userSchema.index({ teamId: 1, role: 1 });
module.exports = mongoose.model("User", userSchema);
