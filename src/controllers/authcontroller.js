const bcrypt = require("bcrypt");
const User = require("../models/users.model");
const { createJWT } = require("./helper/json_web_token");
const { StatusCodes } = require("http-status-codes");

/* ===================== SIGNUP ===================== */
exports.signup = async (req, res) => {
  try {
    const { username, email, password, role, phoneNumber, bio } = req.body;

    // Validate input
    // if (!username || !email || !password || !phoneNumber) {
    //   return res.status(StatusCodes.BAD_REQUEST).json({
    //     message: "Please provide username, email, password, role, phone number",
    //   });
    // }
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(StatusCodes.CONFLICT).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Profile picture
    const profilePicture = req.file ? `/${req.file.filename}` : "";

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role,
      bio,
      phoneNumber,
      profilePicture,
    });

    await newUser.save();

    return res.status(StatusCodes.CREATED).json({
      message: "User registered successfully",
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Server error",
      error: error.message,
    });
  }
};

/* ===================== LOGIN ===================== */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Invalid email or password",
      });
    }

    const tokenResult = await createJWT({
      data: {
        userId: user._id,
        role: user.role,
      },
      expiry_time: "1h",
    });

    if (!tokenResult.success) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: tokenResult.message,
      });
    }

    return res.status(StatusCodes.OK).json({
      message: "Login successful",
      token: tokenResult.token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Server error",
      error: error.message,
    });
  }
};
