// controllers/follow.controller.js

const FollowUser = require("../models/follow_user.model");
const User = require("../models/users.model");
const FollowRequest = require("../models/followRequest.model");
const {
  getPaginationMetadata,
  getPaginatedResponse,
} = require("../controllers/helper/pagination");

/* ===================== SEND FOLLOW REQUEST ===================== */
exports.followRequests = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user._id;

    if (!receiverId) {
      return res.status(400).json({ message: "receiverId is required" });
    }

    if (senderId.toString() === receiverId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    // already following
    const alreadyFollowing = await FollowUser.findOne({
      followerId: senderId,
      followingId: receiverId,
    });

    if (alreadyFollowing) {
      return res.status(400).json({ message: "You already follow this user" });
    }

    //CHECK: request already exists
    const existingRequest = await FollowRequest.findOne({
      sender: senderId,
      receiver: receiverId,
      status: "requested",
    });

    if (existingRequest) {
      return res.status(400).json({ message: "Request already sent" });
    }

    const request = await FollowRequest.create({
      sender: senderId,
      receiver: receiverId,
    });

    return res.status(201).json({
      message: "Follow request sent",
      request,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

/* ===================== GET PENDING REQUESTS ===================== */
exports.getPendingRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const requests = await FollowRequest.find({
      receiver: userId,
      status: "requested",
    }).populate("sender", "username profilePicture");

    return res.status(200).json({
      count: requests.length,
      data: requests,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

/* ===================== ACCEPT / REJECT REQUEST ===================== */
exports.respondToRequest = async (req, res) => {
  try {
    const { requestId, action } = req.body;

    const request = await FollowRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.status !== "requested") {
      return res.status(400).json({ message: "Request already processed" });
    }

    if (action === "accept") {
      request.status = "accepted";
      await request.save();

      // sender follows receiver
      await FollowUser.create({
        followerId: request.sender,
        followingId: request.receiver,
      });

      await User.findByIdAndUpdate(request.receiver, {
        $inc: { follower_count: 1 },
      });

      await User.findByIdAndUpdate(request.sender, {
        $inc: { following_count: 1 },
      });

      return res.status(200).json({ message: "Request accepted" });
    }

    if (action === "reject") {
      request.status = "rejected";
      await request.save();
      return res.status(200).json({ message: "Request rejected" });
    }

    return res.status(400).json({ message: "Invalid action" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

/* ===================== GET FOLLOWERS (MONGODB) ===================== */
exports.getFollowers = async (req, res) => {
  try {
    const { userId } = req.body;
    const { page, limit, offset } = getPaginationMetadata(
      req.query.page,
      req.query.limit,
    );

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const userExists = await User.exists({ _id: userId });
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    const followers = await FollowUser.find({ followingId: userId })
      .skip(offset)
      .limit(limit)
      .populate("followerId", "username profilePicture");

    const total = await FollowUser.countDocuments({
      followingId: userId,
    });

    return res
      .status(200)
      .json(
        getPaginatedResponse(
          { rows: followers.map((f) => f.followerId), count: total },
          page,
          limit,
        ),
      );
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

/* ===================== GET FOLLOWING (MONGODB) ===================== */
exports.getFollowing = async (req, res) => {
  try {
    const { userId } = req.body;
    const { page, limit, offset } = getPaginationMetadata(
      req.query.page,
      req.query.limit,
    );

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const following = await FollowUser.find({ followerId: userId })
      .skip(offset)
      .limit(limit)
      .populate("followingId", "username profilePicture");

    const total = await FollowUser.countDocuments({
      followerId: userId,
    });

    return res
      .status(200)
      .json(
        getPaginatedResponse(
          { rows: following.map((f) => f.followingId), count: total },
          page,
          limit,
        ),
      );
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
