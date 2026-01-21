const router = require("express").Router();
const { authMiddleware } = require("../middlewares/authmiddleware");
const { sendMessage } = require("../controllers/message.controller");
const { getMessages } = require("../controllers/message.controller");

router.post("/sendMessage", authMiddleware, sendMessage);

router.post("/getMessages", authMiddleware, getMessages);

module.exports = router;
