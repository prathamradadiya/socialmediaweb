const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    type: {
      type: String,
      enum: ["LIKE", "COMMENT", "FOLLOW", "MESSAGE"],
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "posts",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Notification", notificationSchema);
