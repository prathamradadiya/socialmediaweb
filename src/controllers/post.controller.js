const likePost = require("../models/likedpost.model");
const sharePost = require("../models/sharedpost.model");
const commentPost = require("../models/comment.model");
const Post = require("../models/post.model");

//likes

exports.likePost = async (req, res) => {
  try {
    const { postId } = req.body;
    const userId = req.user._id;
    console.log(req.body);

    if (!postId) {
      return res.status(400).json({ message: "PostID required" });
    }

    //find this post from db
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    //for already liked post
    const alreadyLiked = await likePost.findOne({ userId, postId });

    if (alreadyLiked) {
      await likePost.deleteOne({ userId, postId });

      await Post.findByIdAndUpdate(postId, {
        $inc: { likesCount: -1 },
        // $max: { likesCount: 0 },
      });

      return res.status(200).json({ success: true, message: "Post unliked" });
    }

    //user likes post
    await likePost.create({ userId, postId });

    await Post.findByIdAndUpdate(postId, {
      $inc: { likesCount: 1 },
    });

    return res.status(200).json({ success: true, message: "Post liked" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

//share

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
    //find this post from db
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not available" });
    }

    await commentPost.create({
      userId,
      postId,
      comment,
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

const Tag = require("../models/tags.model");
const {
  getPaginationMetadata,
  getPaginatedResponse,
} = require("../controllers/helper/pagination");

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
