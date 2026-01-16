// const mongoose = require("mongoose");
// const Music = require("../models/music.model");
// const Post = require("../models/post.model");

// exports.Createpost = async (req, res) => {
//   try {
//     if (!req.user || !req.user._id) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     const { contentId, musicId } = req.body;
//     console.log(req.body);

//     if (!contentId) {
//       return res.status(400).json({ message: "contentId is required" });
//     }

//     // Validate musicId if provided
//     if (musicId) {
//       if (!mongoose.Types.ObjectId.isValid(musicId)) {
//         return res.status(400).json({ message: "Invalid musicId format" });
//       }

//       const musicExists = await Music.findById(musicId);
//       if (!musicExists) {
//         return res.status(404).json({ message: "Music not found" });
//       }
//     }

//     const post = await Post.create({
//       userId: req.user._id,
//       contentId,
//       musicId: musicId || null,
//     });

//     return res.status(201).json({
//       success: true,
//       post,
//     });
//   } catch (err) {
//     return res.status(500).json({
//       success: false,
//       error: err.message,
//     });
//   }
// };
