const router = require("express").Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const {
  blockUser,
  unblockUser,
  getBlockedUsers,
} = require("../controllers/block.controller");

//====================Block-user=======================
router.post("/blockUser", authMiddleware, blockUser);
//====================UnBlock-user=======================
router.post("/unblock", authMiddleware, unblockUser);

router.get("/getBlockedUsers", authMiddleware, getBlockedUsers);

module.exports = router;
