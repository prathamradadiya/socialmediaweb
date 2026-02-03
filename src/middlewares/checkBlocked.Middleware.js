const BlockedId = require("../models/blocked_acc.model");
const response = require("../helper/response/response");

const checkProfileBlocked = async (req, res, next) => {
  try {
    const viewerId = req.user._id; // person viewing profile
    const profileUserId = req.params.userId; // profile owner

    const isBlocked = await BlockedId.findOne({
      blockerId: profileUserId,
      blockedId: viewerId,
    });

    if (isBlocked) {
      return response.error(res, 9002, 403); // Action not allowed
    }

    next();
  } catch (err) {
    return response.error(res, 9999, 500); // Something went wrong
  }
};

module.exports = checkProfileBlocked;
