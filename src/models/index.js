// models/index.js

module.exports = {
  User: require("./users.model"),
  FollowUser: require("./follow_user.model"),
  Post: require("./post.model"),
  BlockedId: require("./blocked_acc.model"),
  Comment: require("./comment.model"),
  LikePost: require("./likedpost.model"),
  Notification: require("./notification.model"),
  FollowRequest: require("./followRequest.model"),
  Conversation: require("./conversation.model"),
  Chat: require("./chat.model"),
  Group: require("./group.model"),
  Content: require("./content.model"),
  Music: require("./music.model"),
  Tag: require("./tags.model"),
  Upload: require("./uploads.model"),
  BlacklistedToken: require("./black_listed_token"),
};
