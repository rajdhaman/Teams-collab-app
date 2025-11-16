const Joi = require("joi");

const projectValidators = {
  create: Joi.object({
    name: Joi.string().min(2).max(100).required().trim().messages({
      "string.min": "Project name must be at least 2 characters",
      "any.required": "Project name is required",
    }),
    description: Joi.string().max(500).optional().trim(),
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(100).optional().trim(),
    description: Joi.string().max(500).optional().trim(),
    status: Joi.string()
      .valid("ACTIVE", "ARCHIVED", "COMPLETED")
      .optional()
      .messages({
        "any.only": "Status must be one of: ACTIVE, ARCHIVED, COMPLETED",
      }),
  }),
};

module.exports = projectValidators;
