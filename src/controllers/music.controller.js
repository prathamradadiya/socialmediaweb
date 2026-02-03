const { Music } = require("../models");
const uploadToCloudinary = require("../utils/uploader");
const response = require("../helper/response/response");

// ADD MUSIC
exports.addMusic = async (req, res) => {
  try {
    // Check user
    if (!req.user?._id) {
      return response.error(res, 1010, 401); // Unauthorized Users
    }

    // Check if file exists
    const musicFile = req.files?.musicFile;
    if (!musicFile) {
      return response.error(res, 9000, 400); // Please enter valid data
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
      return response.error(res, 9000, 400); // Invalid music file type → use generic invalid data
    }

    // Upload to Cloudinary
    await uploadToCloudinary(musicFile, "music");
    const musicUrl = musicFile.name;

    const title = req.body.title || musicFile.name;

    const song = await Music.create({
      userId: req.user._id,
      title,
      music: musicUrl,
    });

    return response.success(res, 1028, song, 201); // File Uploaded Successfully
  } catch (error) {
    console.error(error);
    return response.error(res, 9999, 500); // Something went wrong
  }
};
