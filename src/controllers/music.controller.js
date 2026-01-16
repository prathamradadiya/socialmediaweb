const Music = require("../models/music.model");

exports.addMusic = async (req, res) => {
  try {
    // imp
    if (!req.user?._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Song file required" });
    }

    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const songPath = `/${req.file.filename}`;

    const song = await Music.create({
      userId: req.user._id,
      title,
      music: songPath,
    });

    res.status(201).json({
      message: "Music uploaded successfully",
      song,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
