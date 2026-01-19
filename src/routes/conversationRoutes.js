const router = require("express").Router();
const { authMiddleware } = require("../middlewares/authmiddleware");
const {
  createConversation,
} = require("../controllers/conversation.controller");

router.post("/createConversation", authMiddleware, createConversation);

module.exports = router;
