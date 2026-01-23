const router = require("express").Router();
const { authMiddleware } = require("../middlewares/auth.middleware");

const { createConversation } = require("../controllers/message.controller");

// Create or get 1-1 conversation
router.post("/conversation", authMiddleware, createConversation);

const { createGroup } = require("../controllers/message.controller");

// Create group
router.post("/create", authMiddleware, createGroup);

const Message = require("../models/message.model");

// Get messages of chat (single or group)
router.get("/:chatId", authMiddleware, async (req, res) => {
  const messages = await Message.find({
    chatId: req.params.chatId,
  }).sort({ createdAt: 1 });

  res.json(messages);
});

module.exports = router;
