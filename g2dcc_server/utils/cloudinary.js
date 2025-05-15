// utils/cloudinary.js
const cloudinary = require("cloudinary").v2;

const cloud_name = process.env.CLOUD_NAME;
const api_key = process.env.CLOUD_API_KEY;
const api_secret = process.env.CLOUD_API_SECRET;

// console.log(cloud_name, api_key, api_secret)

cloudinary.config({
  cloud_name: cloud_name, // 🔁 Thay bằng thông tin từ dashboard Cloudinary
  api_key: api_key,
  api_secret: api_secret,
});

// Upload buffer (giữ nguyên cho các chức năng khác)
async function uploadToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

// Upload base64 (dùng riêng cho forum messages)
async function uploadBase64ToCloudinary(base64String, folder) {
  try {
    const result = await cloudinary.uploader.upload(base64String, {
      folder: folder,
      resource_type: "auto"
    });
    return result;
  } catch (error) {
    console.error("Error uploading base64 to Cloudinary:", error);
    throw error;
  }
}

module.exports = { 
  uploadToCloudinary, 
  uploadBase64ToCloudinary,
  cloudinary 
};
