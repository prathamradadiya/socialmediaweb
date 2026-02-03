const { Post, Music, Tag, Upload, Content } = require("../models");
const uploadToCloudinary = require("../utils/uploader");
const response = require("../helper/response/response");
/* ============================ CREATE POST ============================ */
exports.createPostWithContent = async (req, res) => {
  try {
    let { musicTitle, title, tags } = req.body;

    if (!req.user?._id) {
      return response.error(res, 1010, 401);
    }

    /* ============================ MUSIC ============================ */
    let musicRef = null;
    if (musicTitle) {
      const music = await Music.findOne({
        title: musicTitle.toLowerCase(),
      });

      if (!music) {
        return response.error(res, 9001, 404);
      }
      musicRef = music._id;
    }

    /* ============================ TAGS ============================ */
    if (typeof tags === "string") {
      tags = tags.split(",");
    }
    if (!Array.isArray(tags)) {
      tags = [];
    }

    const invalidTags = tags.filter(
      (t) => typeof t !== "string" || !/^#[a-zA-Z0-9_]{1,30}$/.test(t.trim()),
    );

    if (invalidTags.length > 0) {
      return response.error(res, 9000, 400);
    }

    tags = [...new Set(tags.map((t) => t.trim().toLowerCase()))];

    /* ============================ FILES ============================ */
    let imagesFiles = req.files?.images || [];
    let reelFiles = req.files?.reel || [];

    imagesFiles = Array.isArray(imagesFiles) ? imagesFiles : [imagesFiles];
    reelFiles = Array.isArray(reelFiles) ? reelFiles : [reelFiles];

    if (!imagesFiles.length && !reelFiles.length) {
      return response.error(res, 9000, 400);
    }

    if (imagesFiles.length > 10 || reelFiles.length > 1) {
      return response.error(res, 9000, 400);
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
        return response.error(res, 9000, 400);
      }
    }

    for (const file of reelFiles) {
      if (!allowedVideoTypes.includes(file.mimetype)) {
        return response.error(res, 9000, 400);
      }
    }

    /* ============================ UPLOAD ============================ */
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

    const post = await Post.create({
      userId: req.user._id,
      contentId: content._id,
      musicId: musicRef,
    });

    if (tags.length) {
      await Tag.insertMany(
        tags.map((tag) => ({
          tagName: tag,
          postId: post._id,
        })),
        { ordered: false },
      );
    }

    return response.success(res, 2001, { post, content, tags }, 201);
  } catch (error) {
    console.error(error);
    return response.error(res, 9999, 500);
  }
};

/* ============================ CHAT MEDIA UPLOAD ============================ */
exports.uploadMedia = async (req, res) => {
  try {
    if (!req.files || !req.files.media) {
      return response.error(res, 9000, 400);
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
        return response.error(res, 9000, 400);
      }

      if (isImage) imageCount++;
      if (isVideo) videoCount++;

      if (imageCount > 10 || videoCount > 3) {
        return response.error(res, 9000, 400);
      }

      await uploadToCloudinary(file, "chatMedia", req.user._id.toString());

      const doc = await Upload.create({
        userId: req.user._id,
        url: file.name,
        type: isImage ? "image" : "video",
        mimeType: file.mimetype,
        size: file.size,
      });

      uploadedDocs.push(doc);
    }

    return response.success(res, 1028, uploadedDocs, 200);
  } catch (err) {
    console.error(err);
    return response.error(res, 9999, 500);
  }
};
