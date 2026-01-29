const multer = require("multer");
const path = require("path");

// Ensure this folder exists
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/Images/profileImages");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|mp4/; // add mp4 if you allow videos
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error("Only images and videos are allowed"));
  }
};

const uploadProfileMiddleware = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

module.exports = uploadProfileMiddleware;
