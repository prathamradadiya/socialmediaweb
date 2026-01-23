const { Server } = require("socket.io");
const { verifyJWT } = require("../controllers/helper/json_web_token");
const Chat = require("../models/chat.model");

module.exports = (server) => {
  const io = new Server(server, { cors: { origin: "*" } });

  // JWT middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("No token"));

      const result = await verifyJWT(token);
      if (!result.success) return next(new Error("Invalid or expired token"));

      socket.userId = result.data.userId; // store userId
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.userId);

    socket.on("joinChat", async (roomId) => {
      if (!roomId) return;

      socket.join(roomId);

      const messages = await Chat.find({ roomId }).sort({ timestamp: 1 });
      socket.emit("chatHistory", messages);
    });

    socket.on("sendMessage", async ({ roomId, text }) => {
      if (!roomId || !text) return;

      const message = {
        senderId: socket.userId,
        text,
        time: new Date(),
      };

      await Chat.create({
        senderId: socket.userId,
        roomId,
        text,
        timestamp: new Date(),
        status: "sent",
      });

      // Receiver only
      socket.to(roomId).emit("receiveMessage", message);

      // Sender only
      socket.emit("messageSent", message);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.userId);
    });
  });
  return io;
};
