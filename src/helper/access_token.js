const { User } = require("../models");
const { response } = require("../helper");

exports.refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return response.error(res, 1010, 401);
    }

    const blacklisted = await BlacklistedToken.findOne({ token: refreshToken });
    if (blacklisted) {
      return response.error(res, 1010, 401);
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
    );

    return response.success(res, 1007, { accessToken: newAccessToken });
  } catch (err) {
    return response.error(res, 1010, 401);
  }
};
