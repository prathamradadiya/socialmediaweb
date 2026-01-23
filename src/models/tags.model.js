const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema(
  {
    tagName: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "posts",
      required: true,
    },
  },
  { timestamps: true },
);

// prevent duplicate tag for same post
tagSchema.index({ tagName: 1, postId: 1 }, { unique: true });

module.exports = mongoose.model("Tag", tagSchema);
