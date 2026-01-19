const router = require("express").Router();
const {
  signup,
  login,
  getUserProfile,
} = require("../controllers/authcontroller");

const { authMiddleware } = require("../middlewares/authmiddleware");

const uploadProfile = require("../middlewares/uploadProfileMiddleware");

const {
  loginSchema,
  signupSchema,
} = require("../validation/schemas/users.schema");

const { validate } = require("../middlewares/validation.middleware");

router.post(
  "/signup",
  uploadProfile.single("profilePicture"),
  validate(signupSchema),
  signup
);
router.post("/login", validate(loginSchema), login);

const checkProfileBlocked = require("../middlewares/checkBlocked.Middleware");

router.get(
  "/profile/:userId",
  authMiddleware,
  checkProfileBlocked,
  getUserProfile
);

module.exports = router;
