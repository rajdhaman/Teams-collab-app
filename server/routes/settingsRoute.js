const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/auth");
const validate = require("../middlewares/validation");
const {
  getUserSettings,
  updateUserSettings,
  getTeamSettings,
  updateTeamSettings,
  deleteUserAccount,
} = require("../controllers/settingsController");
const {
  userSettingsSchema,
  teamSettingsSchema,
} = require("../validators/settingsValidators");

// All settings routes require authentication
router.use(authenticate);

// User Settings
router.get("/user", getUserSettings);
router.put("/user", validate(userSettingsSchema), updateUserSettings);
router.delete("/user", deleteUserAccount);

// Team Settings
router.get("/team", getTeamSettings);
router.put("/team", validate(teamSettingsSchema), updateTeamSettings);

module.exports = router;
