const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createJWT } = require("../helper/json_web_token");
const { StatusCodes } = require("http-status-codes");
const client = require("../helper/email_service/email_service");
const uploadToCloudinary = require("../utils/uploader");
const response = require("../helper/response/response");
// const response = require("../helper");

const {
  User,
  FollowUser,
  Post,
  BlockedId,
  BlacklistedToken,
} = require("../models");
const {
  getPaginatedResponse,
  getPaginationMetadata,
} = require("../helper/pagination");

/* ================================= SIGNUP ===================== */
exports.signup = async (req, res) => {
  try {
    const { username, email, password, phoneNumber, bio } = req.body;
    const profilePicture = req.files?.profilePictureImage;

    // Validation
    if (!username || !email || !password || !phoneNumber) {
      return response.error(res, 9000, StatusCodes.BAD_REQUEST);
    }

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return response.error(res, 9003, StatusCodes.CONFLICT);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    let profilePictureName = "";

    if (profilePicture) {
      await uploadToCloudinary(profilePicture, "profilePic");
      profilePictureName = profilePicture.name;
    }

    // Create user
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role: "user",
      phoneNumber,
      bio: bio || "",
      profilePicture: profilePictureName,
      following_count: 0,
      follower_count: 0,
    });

    return response.success(
      res,
      1001, // message code
      {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        profilePicture: profilePictureName,
      },
      StatusCodes.CREATED,
    );
  } catch (error) {
    console.error("Signup error:", error);
    return response.error(res, 9999, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

//================================LOGIN=================================================

exports.loginWithPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return response.error(res, 9000, 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      return response.error(res, 1005, 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return response.error(res, 1005, 401);
    }

    const verification = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({
        to: email,
        channel: "email",
      });

    console.log(verification);

    return response.success(res, 1012); // OTP sent
  } catch (err) {
    return response.error(res, 9999, 500);
  }
};

// ==============================VERIFY OTP======================================
exports.verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return response.error(res, 9000, 400);
    }

    const verificationCheck = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({
        to: email,
        code: otp,
      });

    console.log(verificationCheck.status);

    if (verificationCheck.status !== "approved") {
      return response.error(res, 1014, 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      return response.error(res, 1007, 404);
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
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return response.success(res, 1002, {
      token: tokenResult.token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    return response.error(res, 9999, 500);
  }
};

//===============================Get USER PROFILE=======================================
const mongoose = require("mongoose");

exports.getUserProfile = async (req, res) => {
  try {
    if (!req.user) {
      return response.error(res, 1010, 401); // Unauthorized
    }

    const profileUserId = req.params.userId;
    const viewerId = req.user._id;

    // Check valid Mongo ObjectId
    if (!mongoose.Types.ObjectId.isValid(profileUserId)) {
      return response.error(res, 9000, 400); // Please enter valid data
    }

    const { page, limit, offset } = getPaginationMetadata(
      req.query.page,
      req.query.limit,
    );

    //  Check user exists
    const user = await User.findById(profileUserId).select(
      "username profilePicture bio follower_count following_count",
    );

    if (!user) {
      return response.error(res, 1007, 404); // User not found
    }

    const isBlocked = await BlockedId.findOne({
      $or: [
        { blockerId: profileUserId, blockedId: viewerId },
        { blockerId: viewerId, blockedId: profileUserId },
      ],
    });

    if (isBlocked) {
      return response.success(res, 9020, {
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

    const [posts, totalPosts] = await Promise.all([
      Post.find({ userId: profileUserId })
        .select("contentId musicId likesCount commentCount sharesCount")
        .skip(offset)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Post.countDocuments({ userId: profileUserId }),
    ]);

    return response.success(res, 1003, {
      blocked: false,
      isFollowing: !!isFollowing,
      user,
      posts: getPaginatedResponse(
        { rows: posts, count: totalPosts },
        page,
        limit,
      ),
    });
  } catch (err) {
    console.error(err);
    return response.error(res, 9999, 500);
  }
};

// ========================================Update User Profile========================

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { username, bio, phoneNumber } = req.body;
    let profilePictureFile = req.files?.profilePictureImage;

    const updates = {};

    if (username) updates.username = username;
    if (bio) updates.bio = bio;
    if (phoneNumber) updates.phoneNumber = phoneNumber;

    if (profilePictureFile) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/webp",
      ];

      if (!allowedTypes.includes(profilePictureFile.mimetype)) {
        return response.error(res, 9000, 400); // Invalid image type
      }

      try {
        await uploadToCloudinary(
          profilePictureFile,
          "profilePic",
          userId.toString(),
        );

        updates.profilePicture = profilePictureFile.name;
      } catch (err) {
        console.error("Cloudinary upload error:", err);
        return response.error(res, 1021, 400); // Error while uploading file
      }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return response.error(res, 1007, 404); // User not found
    }

    return response.success(res, 1019, updatedUser, 200);
  } catch (error) {
    console.error("Profile update error:", error);
    return response.error(res, 9999, 500);
  }
};

//======================================LOGOUT=======================================

// exports.logout = async (req, res) => {
//   try {
//     const token =
//       req.cookies.accessToken || req.headers.authorization?.split(" ")[1];

//     if (token) {
//       const decoded = jwt.decode(token);
//       const expiryDate = new Date(decoded.exp * 1000);

//       await BlacklistedToken.create({
//         token,
//         expiresAt: expiryDate,
//       });
//     }

//     // Clear cookie
//     res.clearCookie("accessToken", {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//     });

//     return response.success(res, 1006);
//   } catch (err) {
//     console.error("Logout Error:", err);
//     return response.error(res, 9999, 500);
//   }
// };
exports.logout = async (req, res) => {
  try {
    console.log("Logout called");
    const token =
      req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];

    console.log("Token:", token);

    if (!token) {
      console.log("Token missing");
      return response.error(res, 1010, 401); // Unauthorized
    }

    const decoded = jwt.decode(token);
    console.log("Decoded token:", decoded);

    if (decoded) {
      const expiryDate = new Date(decoded.exp * 1000);
      console.log("Expiry date:", expiryDate);

      await BlacklistedToken.create({
        token,
        expiresAt: expiryDate,
      });
      console.log("Token blacklisted");
    }

    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    console.log("Cookie cleared");

    return response.success(res, 1006);
  } catch (err) {
    console.error("Logout Error:", err);
    return response.error(res, 9999, 500);
  }
};
