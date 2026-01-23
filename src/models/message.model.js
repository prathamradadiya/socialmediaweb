const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    chatType: {
      type: String,
      enum: ["single", "group"],
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    text: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("messages", messageSchema);
