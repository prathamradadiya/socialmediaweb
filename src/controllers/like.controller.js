const likePost = require("../models/likedpost.model");
const sharePost = require("../models/sharedpost.model");
const commentPost = require("../models/comment.model");
const Post = require("../models/post.model");

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
