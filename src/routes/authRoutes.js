const router = require('express').Router();
const{signup, login} = require('../controllers/authcontroller');
const uploadProfile = require('../middlewares/uploadProfileMiddleware');
const {loginSchema, signupSchema} = require('../validation/schemas/users.schema');
const {validate} = require('../middlewares/validation.middleware');

router.post('/signup',validate(signupSchema), uploadProfile.single("profilePicture"), signup);
router.post('/login',validate(loginSchema), login);


// Protected routes
//router.get('/profile', authMiddleware, getProfile);
module.exports = router;

// import { 
//   registerSchema, 
//   loginSchema,
//   updateProfileSchema,
//   changePasswordSchema,
//   userIdSchema
// } from '../validation/schemas/user.schema';
// import { authenticate } from '../middleware/auth.middleware';

// const router = express.Router();

// // Public routes
// router.post('/register', validate(registerSchema), register);
// router.post('/login', validate(loginSchema), login);