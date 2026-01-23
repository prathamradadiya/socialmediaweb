const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../middlewares/auth.middleware");
const { createPostWithContent } = require("../controllers/contentcontroller");
// router.post("/add",authMiddleware,addPostOrReel);
const upload = require("../middlewares/uploadContentMiddleware");

router.post(
  "/create",
  authMiddleware,
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "reel", maxCount: 1 },
  ]),
  createPostWithContent,
);

module.exports = router;
