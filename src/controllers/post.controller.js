const { Tag, Post, Comment, LikePost, User } = require("../models");
const { sendPush } = require("../helper/pushNotification");
const response = require("../helper/response/response");
const {
  getPaginationMetadata,
  getPaginatedResponse,
} = require("../helper/pagination");

//============================ LIKE POST ================================
exports.likePost = async (req, res) => {
  try {
    const { postId } = req.body;
    const userId = req.user._id;

    const post = await Post.findOne({ _id: postId, isDeleted: false });
    if (!post) return response.error(res, 2004, 404);

    const existingLike = await LikePost.findOne({ userId, postId });

    // ========= UNLIKE =========
    if (existingLike && !existingLike.isDeleted) {
      await LikePost.updateOne({ userId, postId }, { isDeleted: true });
      await Post.updateOne({ _id: postId }, { $inc: { likesCount: -1 } });

      return response.success(res, 4002);
    }
    //========= Like ===========
    if (existingLike && existingLike.isDeleted) {
      await LikePost.updateOne({ userId, postId }, { isDeleted: false });
      await Post.updateOne({ _id: postId }, { $inc: { likesCount: 1 } });
    } else {
      await LikePost.create({ userId, postId, isDeleted: false });
      await Post.updateOne({ _id: postId }, { $inc: { likesCount: 1 } });
    }

    // ========= PUSH NOTIFICATION =========
    const postOwnerId = post.userId;

    // Do not notify if user likes own post
    if (postOwnerId.toString() !== userId.toString()) {
      const postOwner = await User.findById(postOwnerId);

      if (postOwner?.deviceToken) {
        await sendPush({
          token: postOwner.deviceToken,
          title: "❤️ New Like",
          body: "Someone liked your post",
          data: {
            type: "LIKE",
            postId: postId.toString(),
          },
        });
      }
    }

    return response.success(res, 4001);
  } catch (err) {
    return response.error(res, 9999, 500);
  }
};

//============================ Comments ================================
exports.commentPost = async (req, res) => {
  try {
    const { postId, comment } = req.body;
    const userId = req.user._id;

    if (!postId || !comment) {
      return response.error(res, 9000, 400); // Please enter valid data
    }

    const post = await Post.findOne({ _id: postId, isDeleted: false });
    if (!post) {
      return response.error(res, 2004, 404); // Post not found
    }

    await Comment.create({
      userId,
      postId,
      comment: comment.trim(),
      isDeleted: false,
    });
    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

    return response.success(res, 3001); // Comment added successfully
  } catch (err) {
    return response.error(res, 9999, 500);
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

    const comments = await Comment.find({ postId, isDeleted: false })
      .skip(offset)
      .limit(limit)
      .populate({ path: "userId", select: "username" });

    const total = await Comment.countDocuments({
      postId,
      isDeleted: false,
    });

    const result = comments.map((c) => ({
      username: c.userId.username,
      comment: c.comment,
    }));

    return res
      .status(200)
      .json(getPaginatedResponse({ rows: result, count: total }, page, limit));
  } catch (err) {
    return response.error(res, 9999, 500);
  }
};

//=========================== Search Post by Tag==============================================
exports.getPostByTag = async (req, res) => {
  try {
    let { tag } = req.params;
    const { page, limit, offset } = getPaginationMetadata(
      req.query.page,
      req.query.limit,
    );

    if (!tag) {
      return response.error(res, 9000, 400); // Please enter valid data
    }

    tag = tag.startsWith("#") ? tag.toLowerCase() : `#${tag.toLowerCase()}`;

    const tags = await Tag.find({ tagName: tag })
      .skip(offset)
      .limit(limit)
      .populate([
        {
          path: "postId",
          populate: [
            { path: "userId", select: "username profilePicture" },
            { path: "contentId", select: "type images reel" },
          ],
        },
      ]);

    const total = await Tag.countDocuments({ tagName: tag });

    return res
      .status(200)
      .json(
        getPaginatedResponse(
          { rows: tags.map((t) => t.postId).filter(Boolean), count: total },
          page,
          limit,
        ),
      );
  } catch (err) {
    return response.error(res, 9999, 500);
  }
};

//====================== DELETE Post ======================
exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.body;
    const userId = req.user._id;

    const post = await Post.findOne({ _id: postId, isDeleted: false });
    if (!post) {
      return response.error(res, 2004, 404); // Post not found
    }

    if (!post.userId.equals(userId)) {
      return response.error(res, 2005, 403); // You cannot edit this post → reuse
    }

    await Post.findByIdAndUpdate(postId, {
      isDeleted: true,
      deletedAt: Date.now(),
    });
    await commentPost.updateMany({ postId }, { isDeleted: true });
    await likePost.updateMany({ postId }, { isDeleted: true });

    return response.success(res, 2003); // Post deleted successfully
  } catch (err) {
    return response.error(res, 9999, 500);
  }
};
