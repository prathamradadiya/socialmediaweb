// // const multer = require("multer");
// const path = require("path");

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/Images/posts");
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

// const fileFilter = (req, file, cb) => {
//   const allowed = /jpeg|jpg|png|mp4|mov/;
//   const ext = allowed.test(path.extname(file.originalname).toLowerCase());
//   if (ext) cb(null, true);
//   else cb(new Error("Only images and videos allowed"));
// };

// const upload = multer({ storage, fileFilter, limits: { fileSize: 100000000 } }); //100 MB

// module.exports = upload;
