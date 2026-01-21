const { Server } = require("socket.io");
const Chat = require("../models/chat.model");
const { verifyJWT } = require("../controllers/helper/json_web_token");

module.exports = (server) => {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  // JWT
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Authentication token missing"));
      }

      const result = await verifyJWT(token);

      if (!result.success) {
        return next(new Error("Invalid or expired token"));
      }

      // save userId on socket
      socket.userId = result.data.userId;

      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.userId);

    // Join a personal room
    socket.join(socket.userId.toString());

    // Listen for sending messages
    socket.on("sendMessage", async ({ receiverId, text }) => {
      try {
        if (!receiverId || !text) return; // validate input

        // Save message to Chat - DB
        await Chat.create({
          senderId: socket.userId,
          receiverId,
          text,
          timestamp: new Date(),
        });

        // Emit to receiver
        io.to(receiverId.toString()).emit("receiveMessage", message);

        // Emit to sender for instant UI update
        socket.emit("receiveMessage", message);
      } catch (err) {
        console.error("sendMessage error:", err.message);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.userId);
    });
  });

  return io;
};
