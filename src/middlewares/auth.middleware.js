const jwt = require("jsonwebtoken");
const { User, BlacklistedToken } = require("../models");
const response = require("../helper/response/response");

// const authMiddleware = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return response.error(res, 1010, 401); // Unauthorized Users
//     }

//     const token = authHeader.split(" ")[1];
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     const user = await User.findById(decoded.userId).select("-password");
//     if (!user) {
//       return response.error(res, 1010, 401); // Unauthorized Users
//     }

//     req.user = user;
//     next();
//   } catch (error) {
//     return response.error(res, 1010, 401); // Invalid / Expired token
//   }
// };

// module.exports = { authMiddleware };
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return response.error(res, 1010, 401);
    }

    const accessToken = authHeader.split(" ")[1];

    const blacklisted = await BlacklistedToken.findOne({ token: accessToken });
    if (blacklisted) return response.error(res, 1010, 401);

    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.userId).select("-password");
    if (!req.user) return response.error(res, 1010, 401);

    next();
  } catch (err) {
    return response.error(res, 1010, 401);
  }
};
module.exports = { authMiddleware };
