const bcrypt = require("bcrypt");
const User = require("../models/users.model");
const { createJWT } = require("./helper/json_web_token");
const { StatusCodes } = require("http-status-codes");

const FollowUser = require("../models/follow_user.model");
const Post = require("../models/post.model");
const BlockedId = require("../models/blocked_acc.model");
const OTP = require("../models/otp.model");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const sendEmail = require("../controllers/helper/email");
/* ===================== SIGNUP ===================== */
exports.signup = async (req, res) => {
  try {
    const { username, email, password, role, phoneNumber, bio } = req.body;

    // Basic validation
    if (!username || !email || !password || !phoneNumber) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Required fields are missing",
      });
    }

    // Check if username OR email already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res.status(StatusCodes.CONFLICT).json({
        message: "Username or email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Profile picture (multer)
    const profilePicture = req.file ? req.file.filename : "";

    // Create user
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role: role || "user",
      phoneNumber,
      bio: bio || "",
      profilePicture,
      following_count: 0,
      follower_count: 0,
    });

    return res.status(StatusCodes.CREATED).json({
      message: "User registered successfully",
      userId: newUser._id,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Server error",
      error: error.message,
    });
  }
};

//LOGIN
exports.loginWithPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email & password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    console.log(`otp:` + otp);

    await OTP.deleteMany({ email });

    await OTP.create({
      email,
      otp: hashedOtp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    });

    await sendEmail(email, "Login OTP", `Your OTP is ${otp}`);

    return res.status(200).json({
      success: true,
      message: "Password verified. OTP sent to email",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// VERIFY OTP
exports.verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email & OTP required" });
    }

    const record = await OTP.findOne({ email });
    if (!record) {
      return res.status(400).json({ message: "OTP expired" });
    }

    if (record.expiresAt < Date.now()) {
      await OTP.deleteMany({ email });
      return res.status(400).json({ message: "OTP expired" });
    }

    // Compare OTP using bcrypt
    const isValidOtp = await bcrypt.compare(otp, record.otp);
    if (!isValidOtp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await OTP.deleteMany({ email });

    const tokenResult = await createJWT({
      data: {
        userId: user._id,
        role: user.role,
      },
      expiry_time: "7d",
    });

    res.cookie("accessToken", tokenResult.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: tokenResult.token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//SEARCH USER PROFILE
exports.getUserProfile = async (req, res) => {
  try {
    const profileUserId = req.params.userId;
    const viewerId = req.user._id;

    const user = await User.findById(profileUserId).select(
      "username profilePicture bio follower_count following_count",
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isBlocked = await BlockedId.findOne({
      $or: [
        { blockerId: profileUserId, blockedId: viewerId },
        { blockerId: viewerId, blockedId: profileUserId },
      ],
    });

    if (isBlocked) {
      return res.status(200).json({
        blocked: true,
        user: {
          username: user.username,
          profilePicture: user.profilePicture,
          bio: user.bio,
          follower_count: 0,
          following_count: 0,
          posts: [],
        },
      });
    }

    const isFollowing = await FollowUser.findOne({
      followerId: viewerId,
      followingId: profileUserId,
    });

    const posts = await Post.find({ userId: profileUserId }).select(
      "contentId musicId likesCount commentCount sharesCount",
    );

    res.status(200).json({
      blocked: false,
      isFollowing: !!isFollowing,
      user,
      posts,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//LOGOUT
exports.logout = async (req, res) => {
  try {
    // ✅ If token is in HTTP-only cookie
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0), // Expire immediately
    });

    // ✅ Return success
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Logout failed",
      error: error.message,
    });
  }
};
