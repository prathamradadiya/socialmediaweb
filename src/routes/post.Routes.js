const router = require("express").Router();
const { authMiddleware } = require("../middlewares/auth.middleware");

const {
  likePost,
  sharePost,
  commentPost,
  deletePost,
  getComments,
} = require("../controllers/post.controller");
const { getPostByTag } = require("../controllers/post.controller");

router.post("/likePost", authMiddleware, likePost);
router.post("/sharePost", authMiddleware, sharePost);
router.post("/commentPost", authMiddleware, commentPost);
router.get("/getPostByTag/:tag", authMiddleware, getPostByTag);
router.delete("/deletePost", authMiddleware, deletePost);
router.get("/getComments/:postId", authMiddleware, getComments);

module.exports = router;
