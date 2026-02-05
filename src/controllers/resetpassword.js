const { User } = require("../models");
const mailSender = require("../helper/email_service/email_service");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");

// //================ SEND RESET PASSWORD EMAIL ===================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If an account exists, a reset link has been sent.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.token = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 min
    await user.save();

    const resetLink = `http://localhost:3001/reset-password.html?token=${resetToken}`;

    await mailSender(
      email,
      "Reset your password",
      `Click here to reset your password:\n\n${resetLink}`,
    );

    res.json({
      success: true,
      message: "Reset password link sent to email",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//================ RESET PASSWORD ===================
exports.resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      token: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Link is expired",
      });
    }

    user.password = await bcrypt.hash(password, 10);
    user.token = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Password reset successful",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
