const FollowUser = require("../models/follow_user.model");
const User = require("../models/users.model");
const FollowRequest = require("../models/followRequest.model");

// user send follow request
exports.followRequests = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user._id;

    //already Sent Request
    const existing = await FollowRequest.findOne({
      sender: senderId,
      receiver: receiverId,
    });
    if (existing)
      return res.status(400).json({ message: "Request already sent" });

    //sending request
    const request = await FollowRequest.create({
      sender: senderId,
      receiver: receiverId,
    });

    res.status(201).json({ message: "Follow request sent", request });
  } catch (err) {}
};

//User get follow request
exports.getPendingRequests = async (req, res) => {
  const userId = req.user._id;

  const requests = await FollowRequest.find({
    receiver: userId,
    status: "pending",
  }).populate("sender", "username profilePicture");

  res.status(200).json(requests);
};

// accept or reject to request
exports.respondToRequest = async (req, res) => {
  const { requestId, action } = req.body;

  const request = await FollowRequest.findById(requestId);
  if (!request) return res.status(404).json({ message: "Request not found" });

  if (action === "accept") {
    request.status = "accepted";
    await request.save();

    // Create follow record
    await FollowUser.create({
      followingId: request.sender,
      followerId: request.receiver,
    });

    //Update counts
    await User.findByIdAndUpdate(request.receiver, {
      $inc: { follower_count: 1 },
    });

    await User.findByIdAndUpdate(request.sender, {
      $inc: { following_count: 1 },
    });

    return res.status(200).json({ message: "Request accepted" });
  } else if (action === "reject") {
    request.status = "rejected";
    await request.save();
    return res.status(200).json({ message: "Request rejected" });
  } else {
    return res.status(400).json({ message: "Invalid action" });
  }
};
