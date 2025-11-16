const express = require("express");
const router = express.Router();
const {
  registerController,
  loginController,
} = require("../controllers/authController");
const validate = require("../middlewares/validation");
const authenticate = require("../middlewares/auth");
const roleCheck = require("../middlewares/roleCheck");
const authValidators = require("../validators/authValidators");
// Registration route
router.post("/register", validate(authValidators.register), registerController);

// Login route (supports ID token or email/password when FIREBASE_API_KEY is set)
router.post("/login", validate(authValidators.login), loginController);

// Assign role (ADMIN only)
router.post(
  "/role/:userId",
  authenticate,
  roleCheck("ADMIN"),
  async (req, res, next) => {
    try {
      const { assignRoleController } = require("../controllers/authController");
      return assignRoleController(req, res, next);
    } catch (err) {
      next(err);
    }
  }
);

router.get("/me", authenticate, async (req, res) => {
  try {
    // Return user with teamId as string ID, not populated object
    const userResponse = {
      ...req.user.toObject(),
      teamId: req.user.teamId._id || req.user.teamId,
    };
    res.status(200).json({
      success: true,
      data: userResponse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
});
module.exports = router;
