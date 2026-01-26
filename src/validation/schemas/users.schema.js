const Joi = require("joi");

const signupSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required().messages({
    "string.base": "Username must be a string",
    "string.empty": "Username cannot be empty",
    "string.min": "Username must be at least 3 characters",
    "string.max": "Username cannot exceed 30 characters",
    "string.alphanum": "Username must only contain alphanumeric characters",
    "any.required": "Username is required",
  }),

  email: Joi.string()
    .lowercase()
    .pattern(/^[a-z0-9._%+-]+@(gmail\.com|outlook\.com)$/)
    .required()
    .messages({
      "string.pattern.base":
        "Only Gmail or Outlook email addresses are allowed",
      "any.required": "Email is required",
    }),

  password: Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Password must be at least 8 characters, include uppercase, lowercase, number and special character",
    }),

  role: Joi.string().valid("user", "admin").optional(),

  phoneNumber: Joi.string()
    .pattern(/^\+91[0-9]{10}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone number must be in format +911234567890",
    }),

  bio: Joi.string().allow("").optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().required(),
});

module.exports = { signupSchema, loginSchema };
