const mongoose = require("mongoose");

const liked_postSchema = new mongoose.Schema({
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

const liked_post = mongoose.model("like_posts", liked_postSchema);

module.exports = liked_post;
