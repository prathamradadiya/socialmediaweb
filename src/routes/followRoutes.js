const router = require("express").Router();
const { authMiddleware } = require("../middlewares/authmiddleware");
const { followUser } = require("../controllers/follow.controller");

router.post("/followUser", authMiddleware, followUser);

module.exports = router;
