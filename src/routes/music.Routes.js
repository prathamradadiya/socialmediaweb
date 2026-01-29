const router = require("express").Router();
const { addMusic } = require("../controllers/music.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

router.post("/uploadSong", authMiddleware, addMusic);

module.exports = router;
