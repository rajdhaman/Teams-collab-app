const Joi = require("joi");

const taskValidators = {
  create: Joi.object({
    title: Joi.string().min(2).max(200).required().trim().messages({
      "string.min": "Task title must be at least 2 characters",
      "any.required": "Task title is required",
    }),
    description: Joi.string().max(1000).optional().trim(),
    projectId: Joi.string().required().messages({
      "any.required": "Project ID is required",
    }),
    priority: Joi.string()
      .valid("LOW", "MEDIUM", "HIGH")
      .optional()
      .default("MEDIUM"),
    dueDate: Joi.date().optional().messages({
      "date.base": "Due date must be a valid date",
    }),
    assignedTo: Joi.string().optional().messages({
      "string.pattern.base": "Invalid user ID",
    }),
  }),

  update: Joi.object({
    title: Joi.string().min(2).max(200).optional().trim(),
    description: Joi.string().max(1000).optional().trim(),
    status: Joi.string()
      .valid("TODO", "IN_PROGRESS", "DONE")
      .optional()
      .messages({
        "any.only": "Status must be one of: TODO, IN_PROGRESS, DONE",
      }),
    priority: Joi.string().valid("LOW", "MEDIUM", "HIGH").optional(),
    dueDate: Joi.date().optional().allow(null),
    assignedTo: Joi.string().optional().allow(null),
    position: Joi.number().optional(),
  }),
};

module.exports = taskValidators;
