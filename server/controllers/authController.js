const admin = require("../config/firebase");
const User = require("../models/Users");
const Team = require("../models/Team");

const registerController = async (req, res) => {
  try {
    const { email, name, teamName, idToken } = req.validatedBody;

    // If ID token is provided, verify it and create MongoDB user
    if (idToken) {
      const decoded = await admin.auth().verifyIdToken(idToken);

      // Check if user already exists in MongoDB
      const existingUser = await User.findOne({ firebaseUid: decoded.uid });
      if (existingUser) {
        return res
          .status(400)
          .json({ success: false, message: "User already registered" });
      }

      // If a team with the given name exists, join it as MEMBER; otherwise create a new team and make this user ADMIN
      let team = null;
      if (teamName) {
        team = await Team.findOne({ name: teamName });
      }

      let roleToAssign = "MEMBER";
      if (!team) {
        // create new team and make this user ADMIN
        team = new Team({ name: teamName || `${name}'s Team`, adminId: null });
        await team.save();
        roleToAssign = "ADMIN";
      }

      // Create User in MongoDB with determined role and team
      const user = new User({
        firebaseUid: decoded.uid,
        email: decoded.email || email,
        name,
        teamId: team._id,
        role: roleToAssign,
      });
      await user.save();

      // If user is ADMIN, update team adminId and add to members; otherwise add as a member
      if (roleToAssign === "ADMIN") {
        team.adminId = user._id;
        team.members = team.members || [];
        team.members.push({ userId: user._id, role: "ADMIN" });
        await team.save();
      } else {
        team.members = team.members || [];
        team.members.push({ userId: user._id, role: "MEMBER" });
        await team.save();
      }

      // Populate teamId before returning
      await user.populate("teamId", "name");

      // Return complete user object
      const userResponse = {
        _id: user._id,
        firebaseUid: user.firebaseUid,
        email: user.email,
        name: user.name,
        role: user.role,
        teamId: typeof user.teamId === "string" ? user.teamId : user.teamId._id,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          user: userResponse,
        },
      });
    }

    // Fallback: if no idToken, return error
    return res.status(400).json({
      success: false,
      message: "ID token is required for registration",
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Registration failed",
    });
  }
};

/**
 * Assign or change a user's role.
 * Only callable by an ADMIN (enforced by route middleware).
 * Body: { role: 'ADMIN'|'MANAGER'|'MEMBER' }
 */
const assignRoleController = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const allowed = ["ADMIN", "MANAGER", "MEMBER"];
    if (!allowed.includes(role)) {
      return res.status(422).json({ success: false, message: "Invalid role" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.role = role;
    await user.save();

    // If role changed to ADMIN, update the team adminId
    if (role === "ADMIN" && user.teamId) {
      await Team.findByIdAndUpdate(user.teamId, { adminId: user._id });
    }

    return res
      .status(200)
      .json({ success: true, message: "Role updated", data: { user } });
  } catch (error) {
    console.error("Assign role error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to assign role" });
  }
};

const loginController = async (req, res) => {
  try {
    const { email, password, idToken } = req.body || {};

    // If client sent an ID token (recommended), verify it and return the user
    if (idToken) {
      const decoded = await admin.auth().verifyIdToken(idToken);
      const user = await User.findOne({ firebaseUid: decoded.uid }).populate(
        "teamId"
      );
      if (!user || !user.isActive) {
        return res
          .status(401)
          .json({ success: false, message: "User not found or inactive" });
      }

      // Return user with teamId as string ID, not populated object
      const userResponse = {
        _id: user._id,
        firebaseUid: user.firebaseUid,
        email: user.email,
        name: user.name,
        role: user.role,
        teamId: typeof user.teamId === "string" ? user.teamId : user.teamId._id,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: { user: userResponse },
      });
    }

    // If email/password flow is requested, attempt to use Firebase REST API
    // This requires `FIREBASE_API_KEY` in env. If not present, instruct client to authenticate and provide an ID token instead.
    const apiKey = process.env.FIREBASE_API_KEY;
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        message:
          "Password sign-in not available on server. Client should sign in with Firebase SDK and send an ID token, or set FIREBASE_API_KEY in server env to enable email/password sign-in via REST API.",
      });
    }

    if (!email || !password) {
      return res
        .status(422)
        .json({ success: false, message: "Email and password are required" });
    }

    // Use Firebase Auth REST API to sign in with email/password
    const signInUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;

    // Use global fetch (Node 18+) or fallback to throwing a clear error
    if (typeof fetch !== "function") {
      return res.status(500).json({
        success: false,
        message:
          "Server environment does not provide `fetch`. Set up a fetch polyfill or use the ID token flow.",
      });
    }

    const resp = await fetch(signInUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    });
    const data = await resp.json();
    if (!resp.ok) {
      return res.status(401).json({
        success: false,
        message: data.error?.message || "Authentication failed",
        details: data,
      });
    }

    // data contains idToken, refreshToken, localId (uid), email
    const user = await User.findOne({ firebaseUid: data.localId }).populate(
      "teamId"
    );

    // Return user with teamId as string ID, not populated object
    const userResponse = {
      ...user.toObject(),
      teamId: user.teamId._id || user.teamId,
    };

    return res.status(200).json({
      success: true,
      data: {
        firebase: {
          idToken: data.idToken,
          refreshToken: data.refreshToken,
          expiresIn: data.expiresIn,
          uid: data.localId,
          email: data.email,
        },
        user: userResponse,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Login failed" });
  }
};
module.exports = {
  registerController,
  assignRoleController,
  loginController,
};
