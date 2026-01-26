const router = require("express").Router();
const {
  signup,
  getUserProfile,
  loginWithPassword,
  verifyLoginOtp,
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
router.post(
  "/signup",
  uploadProfile.single("profilePicture"),
  validate(signupSchema),
  signup,
);

//LOGIN ROUTES
router.post("/login", validate(loginSchema), loginWithPassword);

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
