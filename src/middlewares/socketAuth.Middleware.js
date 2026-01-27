// middlewares/socketAuth.js
const { verifyJWT } = require("../controllers/helper/json_web_token");

const socketAuth = async (socket, next) => {
  try {
    // Get token from headers or query
    const token =
      socket.handshake.headers?.authorization
        ?.replace(/^Bearer\s+/i, "")
        ?.trim() || socket.handshake.query?.token;

    if (!token) return next(new Error("No token"));

    const result = await verifyJWT(token);
    if (!result.success) return next(new Error("Invalid or expired token"));

    socket.userId = result.data.userId;
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
};

module.exports = socketAuth;
