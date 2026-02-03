// const nodemailer = require("nodemailer");

// //TRANSPORTER
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// //SEND EMAIL
// const sendEmail = async (to, subject, text) => {
//   await transporter.sendMail({
//     from: `"Instagram" <${process.env.EMAIL_USER}>`,
//     to,
//     subject: "Login OTP expires in 5 min..... ",
//     text,
//   });
// };

// module.exports = sendEmail;
// utils/sendEmail.js
// const sgMail = require("@sendgrid/mail");
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// const sendOtpEmail = async (user, otp) => {
//   try {
//     const msg = {
//       to: user.email,
//       from: process.env.SENDGRID_SENDER_EMAIL, // verified sender
//       templateId: process.env.SENDGRID_TEMPLATE_ID,
//       dynamic_template_data: {
//         name: user.username, // must match {{name}}
//         otp: otp, // must match {{otp}}
//       },
//     };

//     await sgMail.send(msg);
//     console.log("OTP email sent");
//   } catch (err) {
//     console.error(err.response?.body || err.message);
//   }
// };
