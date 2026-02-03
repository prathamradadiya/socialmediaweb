const { User } = require("../models");
const mailSender = require("../helper/email_service/email_service");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

//================SEND RESET PASSWORD EMAIL===================

exports.resetPasswordToken = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email: email.trim() });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Email is not registered" });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    // Reset link
    const resetUrl = `http://localhost:3001/api/auth/reset-password/${resetToken}`;

    // Load HTML template
    const templatePath = path.join(
      __dirname,
      "../helper/email_service/emailTemplete/forgot_pass.html",
    );
    let htmlTemplate = fs.readFileSync(templatePath, "utf-8");

    // Replace placeholder with actual link
    htmlTemplate = htmlTemplate.replace("{{RESET_LINK}}", resetUrl);

    // Send email
    await mailSender(user.email, "Password Reset Request", htmlTemplate, true); // true = HTML email

    return res.status(200).json({
      success: true,
      message: "Password reset email sent successfully",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while sending reset email",
    });
  }
};

//============================RESET PASSWORD USING TOKEN====================

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required",
      });
    }

    // Hash incoming token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find valid user
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Update password
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Send temp password
    await mailSender(
      user.email,
      "Password Reset Successful",
      `Your password has been reset.\n\nTemporary Password: ${tempPassword}\n\nPlease login and change it immediately.`,
    );

    return res.status(200).json({
      success: true,
      message: "Password reset successful. Check your email.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while resetting password",
    });
  }
};
