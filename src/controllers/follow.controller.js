const FollowUser = require("../models/follow_user.model");
const User = require("../models/users.model");

exports.followUser = async (req, res) => {
  try {
    const { followUserId } = req.body;

    const currentUserId = req.user._id;

    if (!followUserId) {
      res.status(400).json({ error: "follow user id required" });
    }

    //not follow to self
    if (currentUserId.toString() === followUserId) {
      return res.status(400).json({ error: "You cannot follow yourself" });
    }

    //Check already followed
    const alreadyFollowed = await FollowUser.findOne({
      followingId: currentUserId,
      followerId: followUserId,
    });

    if (alreadyFollowed) {
      return res.status(400).json({ error: "Already following this user" });
    }

    // Create follow record
    await FollowUser.create({
      followingId: currentUserId,
      followerId: followUserId,
    });

    //Update counts
    await User.findByIdAndUpdate(currentUserId, {
      $inc: { following_count: 1 },
    });

    await User.findByIdAndUpdate(followUserId, {
      $inc: { follower_count: 1 },
    });

    return res.status(200).json({
      success: true,
      message: "User followed successfully",
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
