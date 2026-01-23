const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    userId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("conversations", conversationSchema);
