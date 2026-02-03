const MESSAGES = {
  // User Authentication
  1001: "Register successfully.",
  1002: "Sign in successfully.",
  1003: "Get profile successfully.",
  1004: "Already registered with this email!",
  1005: "Please enter correct email and password.",
  1006: "Logout successfully.",
  1007: "User not found!",
  1008: "Profile updated successfully!",
  1009: "Please enter correct password.",
  1010: "Unauthorized Users.",
  1011: "Error while sending email.",
  1012: "Email sent successfully. Please check your email.",
  1013: "Please enter correct OTP.",
  1014: "Link expired. Please try again.",
  1015: "Link verified successfully.",
  1016: "Password changed successfully.",
  1017: "Account deleted successfully.",
  1018: "Your account is deactivated. Please contact admin.",
  1019: "Profile updated successfully!",
  1020: "Error while generating forgot password link.",
  1021: "Error while uploading file.",
  1022: "You have no permission to perform this action.",
  1023: "User Blocked Successfully",
  1024: "Already Blocked User !",
  1025: "User Unblocked Successfully",
  1026: "Already Unblocked User !",
  1027: "Get Blocked profiles successfully",
  1028: "File Uploaded Successfully",
  1029: "Getting All Follow Requests",
  1030: "current password is incorrect",

  // Posts
  2001: "Post created successfully.....",
  2002: "Post updated successfully.",
  2003: "Post deleted successfully.",
  2004: "Post not found.",
  2005: "You cannot edit this post.",
  2006: "You cannot delete this post.",

  // Comments
  3001: "Comment added successfully.",
  3002: "Comment updated successfully.",
  3003: "Comment deleted successfully.",
  3004: "Comment not found.",
  3005: "You cannot edit this comment.",
  3006: "You cannot delete this comment.",

  // Likes
  4001: "Liked successfully.",
  4002: "Unliked successfully.",
  4003: "You already liked this post.",

  // Follows
  5001: "User followed successfully.",
  5002: "User unfollowed successfully.",
  5003: "Cannot follow yourself.",
  5004: "Follow request sent successfully.",
  5005: "Follow request accepted.",
  5006: "Follow request rejected.",
  5007: "Follow request not found.",
  5008: "Follow request already processed.",

  // Messages / Chat
  6001: "Message sent successfully.",
  6002: "Message deleted successfully.",
  6003: "Conversation not found.",
  6004: "Conversation Created",
  6005: "Group Created",

  // Notifications
  7001: "Notification sent successfully.",
  7002: "Notification read successfully.",
  7003: "No notifications found.",

  // Common / General

  9000: "Please enter valid data!",
  9001: "Not found.",
  9002: "Action not allowed.",
  9003: "Already exists............",
  9004: "Cannot perform this action.",
  9005: "Username already taken",
  9999: "Something went wrong!",
};

module.exports.getMessage = function (messageCode) {
  if (isNaN(messageCode)) {
    return messageCode;
  }
  return messageCode ? MESSAGES[messageCode] : "";
};
