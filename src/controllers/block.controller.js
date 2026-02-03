const mongoose = require("mongoose");
const { BlockedId } = require("../models");
const response = require("../helper/response/response");
const {
  getPaginationMetadata,
  getPaginatedResponse,
} = require("../helper/pagination");

/* ===================== BLOCK USER ===================== */
exports.blockUser = async (req, res) => {
  try {
    const { blockedId } = req.body;
    const currentUserId = req.user._id;

    if (!blockedId) {
      return response.error(res, 9000, 400);
    }

    if (!mongoose.Types.ObjectId.isValid(blockedId)) {
      return response.error(res, 9000, 400);
    }

    if (currentUserId.toString() === blockedId) {
      return response.error(res, 9002, 400); // cannot block yourself
    }

    const alreadyBlocked = await BlockedId.findOne({
      blockerId: currentUserId,
      blockedId,
    });

    if (alreadyBlocked) {
      return response.error(res, 1024, 400); // Already exists
    }

    await BlockedId.create({
      blockerId: currentUserId,
      blockedId,
    });

    return response.success(res, 1023);
  } catch (err) {
    console.error(err);
    return response.error(res, 9999, 500);
  }
};

/* ===================== UNBLOCK USER ===================== */
exports.unblockUser = async (req, res) => {
  try {
    const { blockedId } = req.body;
    const currentUserId = req.user._id;

    if (!blockedId) {
      return response.error(res, 9000, 400);
    }

    if (!mongoose.Types.ObjectId.isValid(blockedId)) {
      return response.error(res, 9000, 400);
    }

    const result = await BlockedId.deleteOne({
      blockerId: currentUserId,
      blockedId,
    });

    if (result.deletedCount === 0) {
      return response.error(res, 1026, 400);
    }

    return response.success(res, 1025);
  } catch (err) {
    console.error(err);
    return response.error(res, 9999, 500);
  }
};

/* ===================== GET BLOCKED USERS ===================== */
exports.getBlockedUsers = async (req, res) => {
  try {
    const userId = req.user._id;

    const { page, limit, offset } = getPaginationMetadata(
      req.query.page,
      req.query.limit,
    );

    const blocked = await BlockedId.find({ blockerId: userId })
      .skip(offset)
      .limit(limit)
      .populate("blockedId", "username profilePicture");

    const total = await BlockedId.countDocuments({
      blockerId: userId,
    });

    return response.success(
      res,
      1027,
      getPaginatedResponse(
        {
          rows: blocked.map((b) => b.blockedId).filter(Boolean),
          count: total,
        },
        page,
        limit,
      ),
    );
  } catch (err) {
    console.error(err);
    return response.error(res, 9999, 500);
  }
};
