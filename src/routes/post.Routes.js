const router = require("express").Router();
const { authMiddleware } = require("../middlewares/auth.middleware");

const {
  likePost,
  sharePost,
  commentPost,
  deletePost,
} = require("../controllers/post.controller");
const { getPostByTag } = require("../controllers/post.controller");

router.post("/likePost", authMiddleware, likePost);
router.post("/sharePost", authMiddleware, sharePost);
router.post("/commentPost", authMiddleware, commentPost);
router.get("/getPostByTag/:tag", authMiddleware, getPostByTag);
router.delete("/deletePost", authMiddleware, deletePost);

module.exports = router;
