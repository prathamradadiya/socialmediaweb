const router = require("express").Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const {
  followRequests,
  getPendingRequests,
  respondToRequest,
  getFollowers,
  getFollowing,
} = require("../controllers/follow.controller");

router.post("/followRequests", authMiddleware, followRequests);
router.get("/getPendingRequests", authMiddleware, getPendingRequests);
router.post("/respondToRequest", authMiddleware, respondToRequest);
router.get("/getFollowers", authMiddleware, getFollowers);
router.get("/getFollowing", authMiddleware, getFollowing);
module.exports = router;
