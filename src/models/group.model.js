const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    name: String,
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("groups", groupSchema);
