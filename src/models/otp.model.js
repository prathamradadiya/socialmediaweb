const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    otp: {
      type: String, // hashed OTP
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      expires: 300, // 5 minutes TTL
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("email_otps", otpSchema);
