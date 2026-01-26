const mongoose = require("mongoose");
const followRequestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    status: {
      type: String,
      enum: ["requested", "accepted", "rejected"],
      default: "requested",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("FollowRequest", followRequestSchema);
