const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../../.env"),
});

const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

module.exports = client;
