const router = require("express").Router();
const {
  signup,
  getUserProfile,
  updateProfile,
  loginWithPassword,
  verifyLoginOtp,
  logout,
} = require("../controllers/auth.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
// const uploadProfile = require("../middlewares/uploadProfileMiddleware");
const { loginSchema, signupSchema, updateProfileSchema } = require("../helper");
const { validate } = require("../middlewares/validation.middleware");

const checkProfileBlocked = require("../middlewares/checkBlocked.Middleware");

//====================SIGN UP ROUTES================
// SIGNUP
// router.post(
//   "/signup",
//   uploadProfile.single("profilePicture"),
//   validate(signupSchema),
//   signup,
// );
router.post("/signup", validate(signupSchema), signup);

//LOGIN ROUTES
router.post("/login", validate(loginSchema), loginWithPassword);

// Logout route
router.post("/logout", authMiddleware, logout);

//=========================Get Profiles=========================
router.get(
  "/profile/:userId",
  authMiddleware,
  checkProfileBlocked,
  getUserProfile,
);

//========================Update--User========================
router.put(
  "/updateProfile",
  authMiddleware,
  validate(updateProfileSchema),
  updateProfile,
);

//========================VERIFY OTP ROUTES====================
router.post("/verify-otp", verifyLoginOtp);

module.exports = router;
