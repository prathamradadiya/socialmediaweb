exports.Createpost = async (req, res) => {
  try {
    const { contentId } = req.body;

    const post = await Post.create({
      userId: req.user._id,
      content_id: contentId,
    });

    res.status(201).json({
      success: true,
      post,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};
