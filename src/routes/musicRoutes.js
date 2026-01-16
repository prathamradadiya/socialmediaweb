const router = require("express").Router();
const uploadMusic = require("../middlewares/uploadMusic.Middleware");
const { addMusic } = require("../controllers/music.controller");
const { authMiddleware } = require("../middlewares/authmiddleware");

router.post(
  "/uploadSong",
  authMiddleware,
  uploadMusic.single("music"),
  addMusic
);

module.exports = router;
