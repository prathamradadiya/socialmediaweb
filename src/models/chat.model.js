const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    roomId: String,

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    text: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("chats", chatSchema);
