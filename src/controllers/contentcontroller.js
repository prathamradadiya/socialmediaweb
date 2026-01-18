const mongoose = require("mongoose");
const Content = require("../models/content.model");
const Post = require("../models/post.model");
const Music = require("../models/music.model");

exports.createPostWithContent = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { musicTitle, title } = req.body;

    /* ========= MUSIC (USER SENDS TITLE ONLY) ========= */
    let musicRef = null;

    if (musicTitle) {
      const music = await Music.findOne({
        title: { $regex: `^${musicTitle}$`, $options: "i" }
      });

      if (!music) {
        return res.status(404).json({ message: "Music not found" });
      }

      musicRef = music._id; // ✅ AUTO-SAVED
    }

    /* ========= FILES ========= */
    const imagesFiles = req.files?.images || [];
    const reelFiles = req.files?.reel || [];

    if (imagesFiles.length === 0 && reelFiles.length === 0) {
      return res.status(400).json({ message: "Image or Reel required" });
    }

    if (imagesFiles.length > 10) {
      return res.status(400).json({ message: "Max 10 images allowed" });
    }

    if (reelFiles.length > 1) {
      return res.status(400).json({ message: "Only 1 reel allowed" });
    }

    const images = imagesFiles.map(f => `/${f.filename}`);
    const reel = reelFiles.length ? `/${reelFiles[0].filename}` : null;

    /* ========= SAVE CONTENT ========= */
    const content = await Content.create({
      type: reel ? "reel" : "post",
      images,
      reel,
      title: title || "",
      music: musicRef, // ✅ saved automatically
    });

    /* ========= SAVE POST ========= */
    const post = await Post.create({
      userId: req.user._id,
      contentId: content._id,
      musicId: musicRef, // ✅ saved automatically
    });

    return res.status(201).json({
      success: true,
      message: "Post created successfully",
      post,
      content,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
