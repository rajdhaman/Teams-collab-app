const Joi = require("joi");

const userSettingsSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional().messages({
    "string.min": "Name must be at least 2 characters",
    "string.max": "Name must not exceed 100 characters",
  }),
  notifications: Joi.object({
    emailNotifications: Joi.boolean().optional(),
    taskAssignmentNotifications: Joi.boolean().optional(),
  }).optional(),
});

const teamSettingsSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional().messages({
    "string.min": "Team name must be at least 2 characters",
    "string.max": "Team name must not exceed 100 characters",
  }),
  description: Joi.string().max(500).optional().allow("").messages({
    "string.max": "Description must not exceed 500 characters",
  }),
});

module.exports = {
  userSettingsSchema,
  teamSettingsSchema,
};
