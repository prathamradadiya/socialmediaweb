const likePost = require("../models/likedpost.model");
const sharePost = require("../models/sharedpost.model");
const commentPost = require("../models/comment.model");
const Post = require("../models/post.model");
const Tag = require("../models/tags.model");
const {
  getPaginationMetadata,
  getPaginatedResponse,
} = require("../controllers/helper/pagination");

//==================likes==========================
exports.likePost = async (req, res) => {
  try {
    const { postId } = req.body;
    const userId = req.user._id;

    if (!postId) {
      return res.status(400).json({ message: "PostId required" });
    }

    // Check post exists & not deleted
    const post = await Post.findOne({ _id: postId, isDeleted: false });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check like status
    const existingLike = await likePost.findOne({ userId, postId });

    // 1: Already liked
    if (existingLike && !existingLike.isDeleted) {
      await likePost.updateOne({ userId, postId }, { isDeleted: true });

      await Post.updateOne(
        { _id: postId, likesCount: { $gt: 0 } },
        { $inc: { likesCount: -1 } },
      );

      return res.status(200).json({ message: "Post unLiked" });
    }

    // 2: Liked before, now re-like
    if (existingLike && existingLike.isDeleted) {
      await likePost.updateOne({ userId, postId }, { isDeleted: false });

      await Post.updateOne({ _id: postId }, { $inc: { likesCount: 1 } });

      return res.status(200).json({ message: "Post liked" });
    }

    // Case 3: First time like
    await likePost.create({
      userId,
      postId,
      isDeleted: false,
    });

    await Post.updateOne({ _id: postId }, { $inc: { likesCount: 1 } });

    return res.status(200).json({ message: "Post liked" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

//===============share=========================
exports.sharePost = async (req, res) => {
  try {
    const { postId, sharedUserId } = req.body;
    const userId = req.user._id;

    //if post not available
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not available" });
    }

    const alreadyShared = await sharePost.findOne({ userId, postId });

    if (alreadyShared) {
      return res
        .status(400)
        .json({ message: "You Can't share Post multiple Time..." });
    }

    await sharePost.create({
      userId,
      postId,
      sharedUserId,
    });

    await Post.findByIdAndUpdate(postId, {
      $inc: { sharesCount: 1 },
    });
    return res
      .status(200)
      .json({ success: true, message: "Post Shared Successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

//Comments
exports.commentPost = async (req, res) => {
  try {
    const { postId, comment } = req.body;
    const userId = req.user._id;
    console.log(req.body);

    if (!postId && !comment) {
      return res
        .status(400)
        .json({ message: "PostID and comment not found!!!" });
    }

    const post = await Post.findOne({ _id: postId, isDeleted: false });

    if (!post) {
      return res.status(404).json({ message: "Post not available" });
    }

    await commentPost.create({
      userId,
      postId,
      comment: comment.trim(),
      isDeleted: false,
    });

    await Post.findByIdAndUpdate(postId, {
      $inc: { commentsCount: 1 },
    });

    return res
      .status(200)
      .json({ success: true, message: "Comment Added Successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

//========================GetAll Comments of Post================================

exports.getComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const { page, limit, offset } = getPaginationMetadata(
      req.query.page,
      req.query.limit,
    );

    // Fetch comments and populate username
    const comments = await commentPost
      .find({ postId, isDeleted: false })
      .skip(offset)
      .limit(limit)
      .populate({
        path: "userId",
        select: "username",
      });

    console.log(comments);

    // Total count for pagination
    const total = await commentPost.countDocuments({
      postId,
      isDeleted: false,
    });

    // Map only username and comment
    const result = comments.map((c) => ({
      username: c.userId.username,
      comment: c.comment,
    }));

    return res.status(200).json(
      getPaginatedResponse(
        {
          rows: result,
          count: total,
        },
        page,
        limit,
      ),
    );
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//========================Search Post by Tag==============================================

exports.getPostByTag = async (req, res) => {
  try {
    let { tag } = req.params;
    const { page, limit, offset } = getPaginationMetadata(
      req.query.page,
      req.query.limit,
    );

    if (!tag) {
      return res
        .status(400)
        .json({ success: false, message: "Tag is required" });
    }

    // Normalize tag (recommended)
    tag = tag.startsWith("#") ? tag.toLowerCase() : `#${tag.toLowerCase()}`;

    const tags = await Tag.find({ tagName: tag })
      .skip(offset)
      .limit(limit)
      .populate({
        path: "postId",
        populate: [
          { path: "userId", select: "username profilePicture" },
          { path: "contentId" },
        ],
      });

    const total = await Tag.countDocuments({ tagName: tag });

    return res.status(200).json(
      getPaginatedResponse(
        {
          rows: tags.map((t) => t.postId),
          count: total,
        },
        page,
        limit,
      ),
    );
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// DELETE Post
exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.body;
    const userId = req.user._id;

    //Find post
    const post = await Post.findOne({
      _id: postId,
      isDeleted: false,
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    //Ownership check
    if (!post.userId.equals(userId)) {
      return res.status(403).json({
        message: "Not authorized for this post",
      });
    }

    //Soft delete post
    await Post.findByIdAndUpdate(postId, {
      isDeleted: true,
      deletedAt: Date.now(),
    });

    //Soft delete related comments
    await commentPost.updateMany({ postId }, { isDeleted: true });

    //Soft delete related likes
    await likePost.updateMany({ postId }, { isDeleted: true });

    return res.status(200).json({
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};
