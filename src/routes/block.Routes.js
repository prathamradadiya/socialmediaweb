const router = require("express").Router();
const { authMiddleware } = require("../middlewares/authmiddleware");
const { blockUser, unblockUser } = require("../controllers/block.controller");

router.post("/blockUser", authMiddleware, blockUser);

router.post("/unblock", authMiddleware, unblockUser);

module.exports = router;
