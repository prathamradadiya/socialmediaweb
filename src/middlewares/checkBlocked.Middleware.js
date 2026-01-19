const BlockedId = require("../models/blocked_acc.model");

const checkProfileBlocked = async (req, res, next) => {
  try {
    const viewerId = req.user._id;
    const profileUserId = req.params.userId;

    const isBlocked = await BlockedId.findOne({
      blockerId: viewerId, // profile owner
      blockedId: profileUserId, // viewer
    });

    // if (isBlocked) {
    //   return res.status(200).json({
    //     error: "You  blocked this user",
    //   });
    // }

    next();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = checkProfileBlocked;
