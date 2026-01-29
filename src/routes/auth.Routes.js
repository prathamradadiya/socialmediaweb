const router = require("express").Router();
const {
  signup,
  getUserProfile,
  loginWithPassword,
  verifyLoginOtp,
  logout,
} = require("../controllers/auth.controller");

const { authMiddleware } = require("../middlewares/auth.middleware");
const uploadProfile = require("../middlewares/uploadProfileMiddleware");
const {
  loginSchema,
  signupSchema,
} = require("../validation/schemas/users.schema");
const { validate } = require("../middlewares/validation.middleware");

const checkProfileBlocked = require("../middlewares/checkBlocked.Middleware");

//SIGN UP ROUTES
// SIGNUP
// router.post(
//   "/signup",
//   uploadProfile.single("profilePicture"), // ✅ must be before validation/controller
//   validate(signupSchema),
//   signup,
// );
router.post("/signup", validate(signupSchema), signup);

//LOGIN ROUTES
router.post("/login", validate(loginSchema), loginWithPassword);

//LOGOUT

router.post("/logout", authMiddleware, logout);

//VERIFY OTP ROUTES
router.post("/verify-otp", verifyLoginOtp);

//PROFILE SEARCH ROUTES
router.get(
  "/profile/:userId",
  authMiddleware,
  checkProfileBlocked,
  getUserProfile,
);

module.exports = router;
