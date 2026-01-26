// controllers/blocked.controller.js
const BlockedUser = require("../models/blocked_acc.model");
const User = require("../models/users.model");
const {
  getPaginationMetadata,
  getPaginatedResponse,
} = require("../controllers/helper/pagination");

/* ===================== BLOCK USER ===================== */
exports.blockUser = async (req, res) => {
  try {
    const { blockedId } = req.body;
    const currentUserId = req.user._id;

    if (!blockedId) {
      return res.status(400).json({ error: "blockedId is required" });
    }

    if (currentUserId.toString() === blockedId) {
      return res.status(400).json({ error: "You cannot block yourself" });
    }

    const alreadyBlocked = await BlockedUser.findOne({
      blockerId: currentUserId,
      blockedId,
    });

    if (alreadyBlocked) {
      return res.status(400).json({ error: "User already blocked" });
    }

    await BlockedUser.create({
      blockerId: currentUserId,
      blockedId,
    });

    return res.status(200).json({
      success: true,
      message: "User blocked successfully",
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

/* ===================== UNBLOCK USER ===================== */
exports.unblockUser = async (req, res) => {
  try {
    const { blockedId } = req.body;
    const currentUserId = req.user._id;

    await BlockedUser.deleteOne({
      blockerId: currentUserId,
      blockedId,
    });

    return res.status(200).json({
      success: true,
      message: "User unblocked successfully",
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
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

    const blocked = await BlockedUser.find({ blockerId: userId })
      .skip(offset)
      .limit(limit)
      .populate("blockedId", "username profilePicture");

    const total = await BlockedUser.countDocuments({
      blockerId: userId,
    });

    return res.status(200).json(
      getPaginatedResponse(
        {
          rows: blocked.map((b) => b.blockedId),
          count: total,
        },
        page,
        limit,
      ),
    );
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
