const Joi = require("joi");

const messageValidators = {
  send: Joi.object({
    content: Joi.string().min(1).max(5000).required().trim().messages({
      "string.empty": "Message cannot be empty",
      "any.required": "Message content is required",
    }),
    messageType: Joi.string()
      .valid("TEXT", "SYSTEM", "NOTIFICATION")
      .optional()
      .default("TEXT"),
  }),
};

module.exports = messageValidators;
