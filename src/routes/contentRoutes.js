const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../middlewares/authmiddleware");
const { createPostWithContent } = require("../controllers/contentcontroller");
// router.post("/add",authMiddleware,addPostOrReel);

const upload = require("../middlewares/uploadContentMiddleware");

router.post(
  "/create",
  authMiddleware,
  upload.array("image", 10),
  createPostWithContent
);

module.exports = router;
