const Message = require("../models/message.model");
const Conversation = require("../models/conversation.model");

exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, text } = req.body;

    console.log(req.body);

    if (!conversationId || !text) {
      return res
        .status(400)
        .json({ message: "conversationId and text required" });
    }

    // 1️⃣ Create message
    const message = await Message.create({
      conversationId,
      senderId: req.user._id,
      text, // ✅ CORRECT
    });

    // 2️⃣ Update conversation lastMessage
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: text.Id,
    });

    return res.status(201).json({
      success: true,
      message,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.body;

    if (!conversationId) {
      return res.status(400).json({ message: "conversationId required" });
    }

    const messages = await Message.find({ conversationId })
      .populate("senderId", "message")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
};
