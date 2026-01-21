const router = require("express").Router();
const { authMiddleware } = require("../middlewares/authmiddleware");
const {
  likePost,
  sharePost,
  commentPost,
} = require("../controllers/like.controller");

router.post("/likePost", authMiddleware, likePost);
router.post("/sharePost", authMiddleware, sharePost);
router.post("/commentPost", authMiddleware, commentPost);
module.exports = router;
