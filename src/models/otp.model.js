const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      expires: 300,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("email_otps", otpSchema);
