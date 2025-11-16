const Joi = require("joi");
const authValidators = {
  register: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Must be valid email",
      "any.required": "Email is required",
    }),
    idToken: Joi.string().required().messages({
      "any.required": "ID token is required",
    }),
    name: Joi.string().min(2).max(50).required().messages({
      "string.min": "Name must be at least 2 characters",
      "any.required": "Name is required",
    }),
    teamName: Joi.string().min(2).max(50).optional(),
  }),
  // Login accepts either an idToken (recommended) OR email+password (server-side REST flow)
  login: Joi.alternatives().try(
    Joi.object({ idToken: Joi.string().required() }),
    Joi.object({
      email: Joi.string().email().required().messages({
        "string.email": "Must be valid email",
        "any.required": "Email is required",
      }),
      password: Joi.string().required().messages({
        "any.required": "Password is required",
      }),
    })
  ),
};
module.exports = authValidators;
