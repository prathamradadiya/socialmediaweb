
const Content = require("../models/content.model");
// const Post = require("../models/post.model");


exports.createPostWithContent = async (req, res) => {
  try {
    const files = req.files;
    // console.log(files);
     
   
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "Files required" });
    }

    let images = [];
    let reel = null;

    files.forEach((file) => {
      if (file.mimetype.startsWith("image/")) {
        images.push(`/${file.filename}`);
      } else if (file.mimetype.startsWith("video/")) {
        reel = `/${file.filename}`;
      }
    });

    // validation
    if (images.length > 10) {
      return res.status(400).json({
        message: "Maximum 10 images allowed",
      });
    }

    if (
      reel &&
      files.filter((f) => f.mimetype.startsWith("video/")).length > 1
    ) {
      return res.status(400).json({
        message: "Only 1 reel allowed",
      });
    }

    // save content
    const content = await Content.create({
      type: reel ? "reel" : "post",
      images: images,
      reel: reel,
    });

 
    // const post = await Post.create({
    //   contentId: content._id,

    // });

    res.status(201).json({
      success: true,
      // post,
      content,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
