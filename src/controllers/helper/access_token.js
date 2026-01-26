const User = require("../models/user.model");
const { createJWT, verifyJWT } = require("../utils/json_web_token");

exports.refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token missing" });
    }

    // Verify refresh token
    const decodedToken = await verifyJWT(refreshToken);

    if (!decodedToken.success) {
      throw new Error("Invalid refresh token");
    }

    const userId = decodedToken.data.id;

    const user = await User.findById(userId);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    // Create new access token
    const accessToken = await createJWT({
      data: { id: user._id },
      expiry_time: "15m",
    });

    if (!accessToken.success) {
      throw new Error("Token generation failed");
    }

    // Set new access token
    res.cookie("accessToken", accessToken.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Access token refreshed",
    });
  } catch (err) {
    if (req.cookies?.refreshToken) {
      await User.updateOne(
        { refreshToken: req.cookies.refreshToken },
        { $set: { refreshToken: null } },
      );
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.status(401).json({
      message: "Session expired. Please login again",
    });
  }
};
