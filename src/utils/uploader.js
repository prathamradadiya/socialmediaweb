const path = require("path");
const cloudinary = require("cloudinary").v2;

const uploadToCloudinary = async (file, folder, userId) => {
  const originalName = path.parse(file.name).name; // file name without extension

  return await cloudinary.uploader.upload(file.tempFilePath, {
    folder,
    resource_type: "auto",
    public_id: `${folder}/${userId}_${Date.now()}_${originalName}`,
    use_filename: true,
    unique_filename: false,
  });
};

module.exports = uploadToCloudinary;
