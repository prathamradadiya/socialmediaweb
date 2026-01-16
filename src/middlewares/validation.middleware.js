// src/middleware/validation.middleware.js
const { StatusCodes } = require("http-status-codes");

/**
 * Middleware factory for request validation
 */
const validate = (schema, location = "body") => {
  return (req, res, next) => {
    if (!schema) return next();

    const options = {
      abortEarly: false,
      stripUnknown: true,
      errors: {
        wrap: {
          label: false,
        },
      },
    };

    const { error, value } = schema.validate(req[location], options);

    if (error) {
      const errors = error.details.map((detail) => ({
        path: detail.path.join("."),
        message: detail.message,
      }));

      return res.status(StatusCodes.BAD_REQUEST).json({
        status: "error",
        message: "Validation error",
        errors,
      });
    }

    req[location] = value;
    next();
  };
};

module.exports = { validate };
