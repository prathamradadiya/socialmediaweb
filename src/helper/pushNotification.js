const admin = require("../config/firebase");

exports.sendPush = async ({ token, title, body }) => {
  try {
    await admin.messaging().send({
      token,
      notification: { title, body },
    });

    console.log("Push Notification sent");
  } catch (err) {
    console.log("Push error:", err.message);
  }
};
