const bcrypt = require("bcrypt");
const User = require("../models/users.model");
const { createJWT } = require("./helper/json_web_token");
const { StatusCodes } = require("http-status-codes");
const FollowUser = require("../models/follow_user.model");
const Post = require("../models/post.model");
const BlockedId = require("../models/blocked_acc.model");
//const OTP = require("../models/otp.model");
const client = require("../config/sendgrid");
//const sendEmail = require("../controllers/helper/email");
const uploadToCloudinary = require("../utils/uploader");
const {
  getPaginatedResponse,
  getPaginationMetadata,
} = require("../controllers/helper/pagination");
/* ================================= SIGNUP ===================== */

exports.signup = async (req, res) => {
  try {
    const { username, email, password, phoneNumber, bio } = req.body;
    const profilePicture = req.files.profilePictureImage;

    console.log(req.body);
    console.log(profilePicture);

    // Validation
    if (!username || !email || !password || !phoneNumber) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Required fields are missing",
      });
    }
    // Check if user exists
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

    let profilePictureName = "";

    if (profilePicture) {
      await uploadToCloudinary(profilePicture, "profilePic");
      profilePictureName = profilePicture.name;
    }

    // console.log(profilePicture);

    // Create user
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role: "user",
      phoneNumber,
      bio: bio || "",
      profilePicture: profilePicture.name,
      following_count: 0,
      follower_count: 0,
    });

    return res.status(StatusCodes.CREATED).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        profilePicture: profilePictureName,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Server error",
      error: error.message,
    });
  }
};

//================================LOGIN=================================================

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

    // // Generate OTP
    // const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // const hashedOtp = await bcrypt.hash(otp, 10);
    // console.log(`otp:` + otp);

    // await OTP.deleteMany({ email });

    // await OTP.create({
    //   email,
    //   otp: hashedOtp,
    //   expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    // });

    // await sendEmail(email, "Login OTP", `Your OTP is ${otp}`);

    // SEND OTP VIA TWILIO VERIFY (EMAIL)
    const verification = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({
        to: email,
        channel: "email",
      });

    console.log(verification);

    return res.status(200).json({
      success: true,
      message: "Password verified. OTP sent to email",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==============================VERIFY OTP======================================

exports.verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email & OTP required" });
    }

    // const record = await OTP.findOne({ email });
    // if (!record) {
    //   return res.status(400).json({ message: "OTP expired" });
    // }

    // if (record.expiresAt < Date.now()) {
    //   await OTP.deleteMany({ email });
    //   return res.status(400).json({ message: "OTP expired" });
    // }

    // // Compare OTP using bcrypt
    // const isValidOtp = await bcrypt.compare(otp, record.otp);
    // if (!isValidOtp) {
    //   return res.status(400).json({ message: "Invalid OTP" });
    // }

    //await OTP.deleteMany({ email });

    // VERIFY OTP WITH TWILIO
    const verificationCheck = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({
        to: email,
        code: otp,
      });
    console.log(verificationCheck.status);
    if (verificationCheck.status !== "approved") {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

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

//===============================Get USER PROFILE=======================================

exports.getUserProfile = async (req, res) => {
  try {
    const profileUserId = req.params.userId;
    const viewerId = req.user._id;

    const { page, limit, offset } = getPaginationMetadata(
      req.query.page,
      req.query.limit,
    );

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
        },
        posts: getPaginatedResponse({ rows: [], count: 0 }, page, limit),
      });
    }

    const isFollowing = await FollowUser.findOne({
      followerId: viewerId,
      followingId: profileUserId,
    });

    // Paginated posts
    const [posts, totalPosts] = await Promise.all([
      Post.find({ userId: profileUserId })
        .select("contentId musicId likesCount commentCount sharesCount")
        .skip(offset)
        .limit(limit)
        .sort({ createdAt: -1 }),

      Post.countDocuments({ userId: profileUserId }),
    ]);

    const paginatedPosts = getPaginatedResponse(
      { rows: posts, count: totalPosts },
      page,
      limit,
    );

    res.status(200).json({
      blocked: false,
      isFollowing: !!isFollowing,
      user,
      posts: paginatedPosts,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ========================================Update User Profile========================
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { username, bio, phoneNumber } = req.body;
    let profilePictureFile = req.files?.profilePictureImage;

    console.log(profilePictureFile);

    const updates = {};
    //user want to update fields into updates
    if (username) updates.username = username;
    if (bio) updates.bio = bio;
    if (phoneNumber) updates.phoneNumber = phoneNumber;

    if (profilePictureFile) {
      // // Handle single vs array
      // profilePictureFile = Array.isArray(profilePictureFile)
      //   ? profilePictureFile[0]
      //   : profilePictureFile;

      // Validate MIME type
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/webp",
      ];
      if (!allowedTypes.includes(profilePictureFile.mimetype)) {
        return res.status(400).json({ message: "Invalid image file type" });
      }

      // Upload to Cloudinary
      await uploadToCloudinary(
        profilePictureFile,
        "profilePic",
        userId.toString(),
      );

      // Save original file name
      updates.profilePicture = profilePictureFile.name;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return res.status(500).json({
      success: false,
      message: "Profile Update Failed",
      error: error.message,
    });
  }
};

//======================================LOGOUT=======================================
exports.logout = async (req, res) => {
  try {
    // If token is in HTTP-only cookie
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0), // Expire immediately
    });

    //  Return success
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
