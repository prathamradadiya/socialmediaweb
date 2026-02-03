const { Conversation, Chat, Group } = require("../models");
const response = require("../helper/response/response");

/* ===================== CREATE CONVERSATION ===================== */
exports.createConversation = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return response.error(res, 9000, 400);
    }

    const existing = await Conversation.findOne({
      userId: { $all: [req.user._id, userId] },
    });

    if (existing) {
      return response.success(res, 9003, existing, 200);
    }

    const conversation = await Conversation.create({
      userId: [req.user._id, userId],
    });

    await Chat.create({
      roomId: conversation._id,
    });

    return response.success(res, 6004, conversation, 201);
  } catch (err) {
    return response.error(res, 9999, 500);
  }
};

/* ===================== CREATE GROUP ===================== */
exports.createGroup = async (req, res) => {
  try {
    const { name, members } = req.body;

    if (!name || !Array.isArray(members)) {
      return response.error(res, 9000, 400);
    }

    const group = await Group.create({
      name,
      admin: req.user._id,
      members: [req.user._id, ...members],
    });

    return response.success(res, 6005, group, 201);
  } catch (err) {
    return response.error(res, 9999, 500);
  }
};
