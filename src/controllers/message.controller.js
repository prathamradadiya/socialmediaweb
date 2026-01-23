const Conversation = require("../models/conversation.model");
const Chat = require("../models/chat.model");

exports.createConversation = async (req, res) => {
  const { userId } = req.body;

  const existing = await Conversation.findOne({
    userId: { $all: [req.user._id, userId] },
  });

  if (existing) return res.json(existing);

  const conversation = await Conversation.create({
    userId: [req.user._id, userId],
  });

  const roomId = await Chat.create({
    roomId: conversation._id,
  });

  res.status(201).json(conversation);
};

// group.controller.js
const Group = require("../models/group.model");

exports.createGroup = async (req, res) => {
  const { name, members } = req.body;

  const group = await Group.create({
    name,
    admin: req.user._id,
    members: [req.user._id, ...members],
  });

  res.status(201).json(group);
};
