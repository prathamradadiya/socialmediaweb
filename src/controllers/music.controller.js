const Music = require("../models/music.model");
const uploadToCloudinary = require("../utils/uploader");

// ADD MUSIC
exports.addMusic = async (req, res) => {
  try {
    // Check user
    if (!req.user?._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Check if file exists
    const musicFile = req.files?.musicFile;
    if (!musicFile) {
      return res.status(400).json({ message: "music File required" });
    }

    // Allowed audio types
    const allowedTypes = [
      "audio/mpeg",
      "audio/wav",
      "audio/aac",
      "audio/ogg",
      "audio/flac",
      "audio/mp4",
    ];

    if (!allowedTypes.includes(musicFile.mimetype)) {
      return res.status(400).json({ message: "Invalid music file type" });
    }

    // Upload to Cloudinary
    await uploadToCloudinary(musicFile, "music");
    const musicUrl = musicFile.name;

    // Use provided title
    const title = req.body.title || musicFile.name;

    // Save in DB
    const song = await Music.create({
      userId: req.user._id,
      title,
      music: musicUrl,
    });

    res.status(201).json({
      message: "Music uploaded successfully",
      song,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
