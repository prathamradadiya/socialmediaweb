const router = require("express").Router();
const {
  signup,
  getUserProfile,
  updateProfile,
  loginWithPassword,
  verifyLoginOtp,
  logout,
  updatePassword,
} = require("../controllers/auth.controller");

const {
  resetPassword,
  forgotPassword,
} = require("../controllers/resetpassword");

const { authMiddleware } = require("../middlewares/auth.middleware");

const { loginSchema, signupSchema, updateProfileSchema } = require("../helper");

const { validate } = require("../middlewares/validation.middleware");

const checkProfileBlocked = require("../middlewares/checkBlocked.Middleware");

//============================SIGNUP ROUTES===============
router.post("/signup", validate(signupSchema), signup);

//========================LOGIN ROUTES==================
router.post("/login", validate(loginSchema), loginWithPassword);

// =============================Logout route=====================
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

// generate token and send email
router.post("/forgot-password", forgotPassword);

// reset password via link clicked in email

router.post("/reset-password", resetPassword);

//Update-Password
router.post("/update-password", authMiddleware, updatePassword);

module.exports = router;
