const jwt = require("jsonwebtoken");

/**
 * Create JWT token
 */
const createJWT = async ({ data, expiry_time = "3h" }) => {
  try {
    const token = jwt.sign(data, process.env.JWT_SECRET, {
      expiresIn: expiry_time,
    });

    return {
      success: true,
      token,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Error while creating token",
    };
  }
};

/**
 * Verify JWT token
 */
const verifyJWT = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return {
      success: true,
      data: decoded,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Invalid token",
    };
  }
};

module.exports = {
  createJWT,
  verifyJWT,
};
