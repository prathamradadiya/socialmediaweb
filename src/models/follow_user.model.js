const mongoose = require("mongoose");

const follow_userSchema = new mongoose.Schema(
  {
    followerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    followingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
  },
  { timestamps: true }
);

const FollowUser = mongoose.model("follow_users", follow_userSchema);

module.exports = FollowUser;
