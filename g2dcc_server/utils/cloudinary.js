// utils/cloudinary.js
const cloudinary = require("cloudinary").v2;

const cloud_name = process.env.CLOUD_NAME;
const api_key = process.env.CLOUD_API_KEY;
const api_secret = process.env.CLOUD_API_SECRET;

// console.log(cloud_name, api_key, api_secret)

cloudinary.config({
  cloud_name: cloud_name,     // 🔁 Thay bằng thông tin từ dashboard Cloudinary
  api_key: api_key,
  api_secret: api_secret,
});

module.exports = cloudinary;
