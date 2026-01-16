const router = require("express").Router();
const { signup, login } = require("../controllers/authcontroller");
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

module.exports = router;
