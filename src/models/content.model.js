const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["post", "reel"],
      required: true,
    },

    images: [
      {
        type: String,
      },
    ],
    reel: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("contents", contentSchema);
