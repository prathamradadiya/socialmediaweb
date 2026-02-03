const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "conversations",
      required: true,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    text: String,

    attachments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "uploads",
      },
    ],
    messageType: {
      type: String,
      enum: ["text", "media", "post"],
      default: "text",
    },
    contentId: { type: mongoose.Schema.Types.ObjectId, ref: "contents" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("chats", chatSchema);
