const router = require("express").Router();
const uploadMusic = require("../middlewares/uploadMusic.Middleware");
const { addMusic } = require("../controllers/music.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

router.post(
  "/uploadSong",
  authMiddleware,
  uploadMusic.single("music"),
  addMusic,
);

module.exports = router;
