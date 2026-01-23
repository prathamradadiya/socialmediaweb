const BlockedId = require("../models/blocked_acc.model");
const User = require("../models/users.model");

exports.blockUser = async (req, res) => {
  try {
    const { blockedId } = req.body;
    const currentUserId = req.user._id;

    if (!blockedId) {
      res.status(400).json({ error: "blocked user's id required" });
    }

    if (currentUserId.toString() === blockedId) {
      return res.status(400).json({ error: "You cannot block yourself" });
    }

    const alreadyBlocked = await BlockedId.findOne({
      blockerId: currentUserId,
      blockedId: blockedId,
    });

    if (alreadyBlocked) {
      return res.status(400).json({ error: "Already Blocked this user" });
    }

    await BlockedId.create({
      blockerId: currentUserId,
      blockedId: blockedId,
    });

    return res.status(200).json({
      success: true,
      message: "User blocked successfully",
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

//for unblock
exports.unblockUser = async (req, res) => {
  try {
    const { blockedId } = req.body;
    const currentUserId = req.user._id;

    await BlockedId.deleteMany({
      $or: [
        { blockerId: currentUserId, blockedId },
        { blockerId: blockedId, blockedId: currentUserId },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "User unblocked successfully",
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
