const nodemailer = require("nodemailer");

//TRANSPORTER
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

//SEND EMAIL
const sendEmail = async (to, subject, text) => {
  await transporter.sendMail({
    from: `"Instagram" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Login OTP expires in 5 min..... ",
    text,
  });
};

module.exports = sendEmail;
