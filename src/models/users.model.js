const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
   email: {
  type: String,
  required: true,
  unique: true,
  lowercase: true
}
,
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    password: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      default: "",
      get: function (filePath) {
        if (!filePath) return filePath;
        return `${process.env.BASE_URL}${filePath}`;
      },
    },

    bio: {
      type: String,
      default: "",
    },

    phoneNumber: {
      type: String,
      default: "",
      required: true,
      match: /^[0-9]{10}$/,
    },

    follower_count: {
      type: Number,
      default: 0,
    },
    following_count: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("users", userSchema);

module.exports = User;
