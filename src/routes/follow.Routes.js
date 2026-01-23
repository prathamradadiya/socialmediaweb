const router = require("express").Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const {
  followRequests,
  getPendingRequests,
  respondToRequest,
} = require("../controllers/follow.controller");

router.post("/followRequests", authMiddleware, followRequests);
router.post("/getPendingRequests", authMiddleware, getPendingRequests);
router.post("/respondToRequest", authMiddleware, respondToRequest);

module.exports = router;
