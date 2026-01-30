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
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

const liked_post = mongoose.model("like_posts", liked_postSchema);

liked_postSchema.index({ userId: 1, postId: 1 }, { unique: true });

module.exports = liked_post;
