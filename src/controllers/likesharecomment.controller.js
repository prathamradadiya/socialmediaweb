const likePost = require("../models/likedpost.model");
const sharePost = require("../models/sharedpost.model");
const commentPost = require("../models/comment.model");
const Post = require("../models/post.model");

exports.likePost = async (req, res) => {
  try {
    const { postId } = req.body;
    const userId = req.user._id;

    if (!postId) {
      return res.status(400).json({ message: "Post ID required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const alreadyLiked = await likePost.findOne({ userId, postId });

    if (alreadyLiked) {
      await likePost.findOneAndDelete({ userId, postId });

      await Post.findByIdAndUpdate(postId, {
        $inc: { likesCount: -1 },
        $max: { likesCount: 0 },
      });

      return res.status(200).json({ success: true, message: "Post unliked" });
    }

    await likePost.create({ userId, postId });

    await Post.findByIdAndUpdate(postId, {
      $inc: { likesCount: 1 },
    });

    return res.status(200).json({ success: true, message: "Post liked" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.sharePost = async (req, res) => {};

exports.commentPost = async (req, res) => {};
