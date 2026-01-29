// const multer = require("multer");
// const path = require("path");

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/Images/musics");
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

// const fileFilter = (req, file, cb) => {
//   const allowed = /mp3|mp4|wav|aac|ogg/;
//   const ext = allowed.test(path.extname(file.originalname).toLowerCase());

//   if (ext) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only audio files are allowed"));
//   }
// };

// const uploadMusic = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
// });

// module.exports = uploadMusic;
