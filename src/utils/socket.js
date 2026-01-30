const { Server } = require("socket.io");
const socketAuth = require("../middlewares/socketAuth.Middleware");
const Chat = require("../models/chat.model");
const mongoose = require("mongoose");

module.exports = (server) => {
  const io = new Server(server, { cors: { origin: "*" } });

  // Auth middleware
  io.use(socketAuth);

  io.on("connection", (socket) => {
    console.log("User connected:", socket.userId);

    // Join chat room
    socket.on("joinChat", async ({ roomId }) => {
      if (!roomId || !mongoose.Types.ObjectId.isValid(roomId)) {
        return socket.emit("error", "Invalid roomId");
      }

      socket.join(roomId);

      const messages = await Chat.find({ roomId })
        .sort({ createdAt: -1 })
        .limit(30)
        .populate({
          path: "attachments",
          select: "_id userId url type size",
        })
        .populate({
          path: "contentId",
          select: "_id title type url",
        });

      //give history while join room
      socket.emit("chatHistory", messages);
    });

    socket.on("sendMessage", async (payload) => {
      try {
        const { roomId, text, attachments, contentId } = payload;

        if (!roomId) return;

        const messageType = attachments?.length
          ? "media"
          : contentId
            ? "post"
            : "text";

        const chat = await Chat.create({
          roomId,
          senderId: socket.userId,
          text,
          messageType,
          attachments,
          contentId,
        });

        const populated = await Chat.findById(chat._id)
          .populate("attachments", "url type size")
          .populate("contentId", "type images reel");

        io.to(roomId).emit("receiveMessage", populated);
      } catch (err) {
        socket.emit("error", "Message failed");
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.userId);
    });
  });

  return io;
};
