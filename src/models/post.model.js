const { types } = require("joi");
const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "contents",
      required: true,
    },
    musicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "musics",
      default: null,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    sharesCount: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

const Post = mongoose.model("posts", postSchema);

postSchema.index({ createdAt: -1 });
postSchema.index({ userId: 1, createdAt: -1 });

module.exports = Post;
