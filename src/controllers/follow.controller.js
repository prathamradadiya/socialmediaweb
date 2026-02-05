const { FollowUser, User, FollowRequest } = require("../models");
const response = require("../helper/response/response");
const { sendPush } = require("../helper/pushNotification");
const {
  getPaginationMetadata,
  getPaginatedResponse,
} = require("../helper/pagination");

/* ===================== SEND FOLLOW REQUEST ===================== */
exports.followRequests = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user._id;

    if (!receiverId) {
      return response.error(res, 9000, 400);
    }

    if (senderId.toString() === receiverId) {
      return response.error(res, 5003, 400);
    }

    const alreadyFollowing = await FollowUser.findOne({
      followerId: senderId,
      followingId: receiverId,
    });

    if (alreadyFollowing) {
      return response.error(res, 9003, 400);
    }

    const existingRequest = await FollowRequest.findOne({
      sender: senderId,
      receiver: receiverId,
      status: "requested",
    });

    if (existingRequest) {
      return response.error(res, 9003, 400);
    }

    const request = await FollowRequest.create({
      sender: senderId,
      receiver: receiverId,
    });

    const receiver = await User.findById(receiverId);
    if (receiver?.deviceToken) {
      await sendPush({
        token: receiver.deviceToken,
        title: "👤 New Follow Request",
        body: "You have a new follow request",
        data: {
          type: "FOLLOW_REQUEST",
          senderId: senderId.toString(),
        },
      });
    }

    return response.success(res, 5004, request, 201);
  } catch (err) {
    return response.error(res, 9999, 500);
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

    return response.success(res, 1029, {
      count: requests.length,
      data: requests,
    });
  } catch (err) {
    return response.error(res, 9999, 500);
  }
};

/* ===================== ACCEPT / REJECT REQUEST ===================== */
exports.respondToRequest = async (req, res) => {
  try {
    const { requestId, action } = req.body;

    if (!requestId || !action) {
      return response.error(res, 9000, 400);
    }

    const request = await FollowRequest.findById(requestId);
    if (!request) {
      return response.error(res, 5007, 404);
    }

    if (request.status !== "requested") {
      return response.error(res, 5008, 400);
    }

    if (action === "accept") {
      request.status = "accepted";
      await request.save();

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

      return response.success(res, 5005);
    }

    if (action === "reject") {
      request.status = "rejected";
      await request.save();
      return response.success(res, 5006);
    }

    return response.error(res, 9000, 400);
  } catch (err) {
    return response.error(res, 9999, 500);
  }
};

/* ===================== GET FOLLOWERS ===================== */

exports.getFollowers = async (req, res) => {
  try {
    const { userId } = req.body;
    const { page, limit, offset } = getPaginationMetadata(
      req.query.page,
      req.query.limit,
    );

    if (!userId) {
      return response.error(res, 9000, 400);
    }

    const following = await FollowUser.find({ followerId: userId })
      .skip(offset)
      .limit(limit)
      .populate("followingId", "username profilePicture");

    const total = await FollowUser.countDocuments({
      followerId: userId,
    });

    return response.success(
      res,
      1003,
      getPaginatedResponse(
        { rows: following.map((f) => f.followingId), count: total },
        page,
        limit,
      ),
    );
  } catch (err) {
    return response.error(res, 9999, 500);
  }
};

/* ===================== GET FOLLOWING ===================== */

exports.getFollowing = async (req, res) => {
  try {
    const { userId } = req.body;
    const { page, limit, offset } = getPaginationMetadata(
      req.query.page,
      req.query.limit,
    );

    if (!userId) {
      return response.error(res, 9000, 400);
    }

    const userExists = await User.exists({ _id: userId });
    if (!userExists) {
      return response.error(res, 1007, 404);
    }

    const followers = await FollowUser.find({ followingId: userId })
      .skip(offset)
      .limit(limit)
      .populate("followerId", "username profilePicture");

    const total = await FollowUser.countDocuments({
      followingId: userId,
    });

    return response.success(
      res,
      1003,
      getPaginatedResponse(
        { rows: followers.map((f) => f.followerId), count: total },
        page,
        limit,
      ),
    );
  } catch (err) {
    return response.error(res, 9999, 500);
  }
};
