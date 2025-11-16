const admin = require("../config/firebase");
const User = require("../models/Users");
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }
    const token = authHeader.split("Bearer ")[1];
    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);
    // Fetch user from database
    const user = await User.findOne({
      firebaseUid: decodedToken.uid,
    }).populate("teamId");
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "User not found or inactive",
      });
    }
    req.user = user;
    req.userId = user._id;
    req.userRole = user.role;
    req.teamId = user.teamId._id;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    if (error.code === "auth/id-token-expired") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
        code: "TOKEN_EXPIRED",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};
module.exports = authenticate;
