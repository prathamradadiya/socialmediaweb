const Content = require("../models/content.model");
const Post = require("../models/post.model");
const Music = require("../models/music.model");
const Tag = require("../models/tags.model");
const Upload = require("../models/uploads.model");
const uploadToCloudinary = require("../utils/uploader");

/* ============================ CREATE POST ============================ */
exports.createPostWithContent = async (req, res) => {
  try {
    let { musicTitle, title, tags } = req.body;

    if (!req.user?._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    /* ============================ MUSIC ============================ */
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

    /* ============================ TAGS ============================ */
    if (typeof tags === "string") tags = tags.split(",");
    if (!Array.isArray(tags)) tags = [];

    tags = tags
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.startsWith("#"));

    /* ============================ FILES ============================ */
    let imagesFiles = req.files?.images || [];
    let reelFiles = req.files?.reel || [];

    imagesFiles = Array.isArray(imagesFiles) ? imagesFiles : [imagesFiles];
    reelFiles = Array.isArray(reelFiles) ? reelFiles : [reelFiles];

    if (!imagesFiles.length && !reelFiles.length) {
      return res.status(400).json({ message: "Image or Reel required" });
    }

    if (imagesFiles.length > 10) {
      return res.status(400).json({ message: "Max 10 images allowed" });
    }

    if (reelFiles.length > 1) {
      return res.status(400).json({ message: "Only 1 reel allowed" });
    }

    /* ============================ FILE TYPE VALIDATION ============================ */
    const allowedImageTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
    ];
    const allowedVideoTypes = ["video/mp4", "video/webm", "video/quicktime"];

    for (const file of imagesFiles) {
      if (!allowedImageTypes.includes(file.mimetype)) {
        return res.status(400).json({
          message: "Only image files allowed in images",
        });
      }
    }

    for (const file of reelFiles) {
      if (!allowedVideoTypes.includes(file.mimetype)) {
        return res.status(400).json({
          message: "Only video files allowed in reel",
        });
      }
    }

    /* ============================ UPLOAD TO CLOUDINARY ============================ */
    const uploadedImages = [];

    for (const file of imagesFiles) {
      await uploadToCloudinary(file, "posts", req.user._id.toString());
      uploadedImages.push(file.name);
    }

    let reelFileName = null;
    if (reelFiles.length) {
      await uploadToCloudinary(reelFiles[0], "reels", req.user._id.toString());

      reelFileName = reelFiles[0].name;
    }

    /* ============================ SAVE CONTENT ============================ */
    const content = await Content.create({
      type: reelFileName ? "reel" : "post",
      images: uploadedImages,
      reel: reelFileName,
      title: title || "",
      music: musicRef,
    });

    /* ============================ SAVE POST ============================ */
    const post = await Post.create({
      userId: req.user._id,
      contentId: content._id,
      musicId: musicRef,
    });

    /* ============================ SAVE TAGS ============================ */
    if (tags.length) {
      await Tag.insertMany(
        tags.map((tag) => ({
          tagName: tag,
          postId: post._id,
        })),
        { ordered: false },
      );
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

/* ============================ CHAT MEDIA UPLOAD ============================ */
exports.uploadMedia = async (req, res) => {
  try {
    if (!req.files || !req.files.media) {
      return res.status(400).json({ message: "No media uploaded" });
    }

    let mediaFiles = req.files.media;
    mediaFiles = Array.isArray(mediaFiles) ? mediaFiles : [mediaFiles];

    let imageCount = 0;
    let videoCount = 0;
    const uploadedDocs = [];

    for (const file of mediaFiles) {
      const isImage = file.mimetype.startsWith("image/");
      const isVideo = file.mimetype.startsWith("video/");

      if (!isImage && !isVideo) {
        return res.status(400).json({
          message: "Only images and videos allowed",
        });
      }

      if (isImage) imageCount++;
      if (isVideo) videoCount++;

      if (imageCount > 10) {
        return res.status(400).json({ message: "Max 10 images allowed" });
      }

      if (videoCount > 3) {
        return res.status(400).json({ message: "Max 3 videos allowed" });
      }

      const uploaded = await uploadToCloudinary(
        file,
        "chatMedia",
        req.user._id.toString(),
      );

      let url = file.name;

      const doc = await Upload.create({
        userId: req.user._id,
        url,
        type: isImage ? "image" : "video",
        mimeType: file.mimetype,
        size: file.size,
      });

      uploadedDocs.push(doc);
    }

    return res.status(200).json({
      success: true,
      uploads: uploadedDocs,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
