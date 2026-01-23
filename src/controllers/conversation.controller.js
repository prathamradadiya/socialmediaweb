// const Conversation = require("../models/conversation.model");
// const User = require("../models/users.model");

// exports.createConversation = async (req, res) => {
//   try {
//     const { type, receiver_id } = req.body;

//     if (!type) {
//       return res.status(400).json({ message: "type is required" });
//     }

//     if (!receiver_id || receiver_id.length === 0) {
//       return res.status(400).json({ message: "receiver_id is required" });
//     }

//     const user = await User.findById(receiver_id);

//     if (!user) {
//       return res.status(400).json({ message: "user is invalid" });
//     }

//     const conversation = await Conversation.create({
//       type,
//       members: [req.user._id, ...receiver_id],
//     });

//     res.status(201).json({
//       success: true,
//       conversation,
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
