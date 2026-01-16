const mongoose = require("mongoose");

const musicSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    music: {
      type: String,
      required: true,
      get: function (filePath) {
        if (!filePath) return filePath;
        return `${process.env.BASE_URL}${filePath}`;
      },
    },
  },
  { timestamps: true }
);
const Music = mongoose.model("musics", musicSchema);

module.exports = Music;
