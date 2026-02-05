const { sendPush } = require("../helper/pushNotification");

exports.testPush = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token required",
      });
    }

    await sendPush({
      token,
      title: "Test 🔥",
      body: "Push notification working!",
    });

    return res.json({
      success: true,
      message: "Push sent successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Push failed",
    });
  }
};
