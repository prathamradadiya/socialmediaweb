const mongoose = require("mongoose");
const Content = require("../models/content.model");
const Post = require("../models/post.model");
const Music = require("../models/music.model");

exports.createPostWithContent = async (req, res) => {
  try {
    // AUTH CHECK
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { musicId, title } = req.body;

    // VALIDATE MUSIC ID (if provided)
    let musicRef = null;
    if (musicId) {
      if (!mongoose.Types.ObjectId.isValid(musicId)) {
        return res.status(400).json({ message: "Invalid musicId format" });
      }

      const musicExists = await Music.findById(musicId);
      if (!musicExists) {
        return res.status(404).json({ message: "Music not found" });
      }

      musicRef = musicExists._id; // store ObjectId in content/post
    }

    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "Files required" });
    }

    // PROCESS FILES
    let images = [];
    let reel = null;

    files.forEach((file) => {
      if (file.mimetype.startsWith("image/")) {
        images.push(`/${file.filename}`);
      } else if (file.mimetype.startsWith("video/")) {
        reel = `/${file.filename}`;
      }
    });

    // VALIDATIONS
    if (images.length > 10) {
      return res.status(400).json({ message: "Maximum 10 images allowed" });
    }

    const videoCount = files.filter((f) =>
      f.mimetype.startsWith("video/")
    ).length;
    if (videoCount > 1) {
      return res.status(400).json({ message: "Only 1 reel allowed" });
    }

    // SAVE CONTENT
    const content = await Content.create({
      type: reel ? "reel" : "post",
      images,
      reel,
      title: title || "",
      music: musicRef, // link music to content
    });

    // SAVE POST
    const post = await Post.create({
      userId: req.user._id,
      contentId: content._id,
      musicId: musicRef, // link music to post as well
    });

    return res.status(201).json({
      success: true,
      post,
      content,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
