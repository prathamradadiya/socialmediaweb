const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "posts",
    required: true,
  },
});

const liked_post = mongoose.model("messages", messageSchema);

module.exports = liked_post;
