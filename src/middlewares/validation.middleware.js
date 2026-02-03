// src/middleware/validation.middleware.js
const response = require("../helper");

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

      return response.error(
        res,
        9000, // Please enter valid data!
        400,
      );
    }

    req[location] = value;
    next();
  };
};

module.exports = { validate };
