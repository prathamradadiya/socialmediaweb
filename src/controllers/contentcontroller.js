const Content = require("../models/content.model");
const Post = require("../models/post.model");
const Music = require("../models/music.model");
const Tag = require("../models/tags.model");

exports.createPostWithContent = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let { musicTitle, title, tags } = req.body;

    if (typeof tags === "string") {
      tags = tags.split(",");
    }

    if (!Array.isArray(tags)) {
      tags = [];
    }

    tags = tags
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.startsWith("#"));

    /* ========= MUSIC ========= */
    let musicRef = null;
    if (musicTitle) {
      const music = await Music.findOne({
        title: { $regex: `^${musicTitle}$`, $options: "i" },
      });
      if (!music) {
        return res.status(404).json({ message: "Music not found" });
      }
      musicRef = music._id;
    }

    /* ========= FILES ========= */
    const imagesFiles = req.files?.images || [];
    const reelFiles = req.files?.reel || [];

    if (!imagesFiles.length && !reelFiles.length) {
      return res.status(400).json({ message: "Image or Reel required" });
    }
    if (imagesFiles.length > 10) {
      return res.status(400).json({ message: "Max 10 images allowed" });
    }
    if (reelFiles.length > 1) {
      return res.status(400).json({ message: "Only 1 reel allowed" });
    }

    const images = imagesFiles.map((f) => `/${f.filename}`);
    const reel = reelFiles.length ? `/${reelFiles[0].filename}` : null;

    /* ========= SAVE CONTENT ========= */
    const content = await Content.create({
      type: reel ? "reel" : "post",
      images,
      reel,
      title: title || "",
      music: musicRef,
    });

    /* ========= SAVE POST ========= */
    const post = await Post.create({
      userId: req.user._id,
      contentId: content._id,
      musicId: musicRef,
    });

    /* ========= SAVE TAGS ========= */
    if (tags.length > 0) {
      const tagDocs = tags.map((tag) => ({
        tagName: tag,
        postId: post._id,
      }));

      await Tag.insertMany(tagDocs, { ordered: false });
    }

    return res.status(201).json({
      success: true,
      message: "Post created successfully",
      post,
      content,
      tags,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
