// middleware/upload.js
const multer = require("multer");

const storage = multer.memoryStorage(); // 👈 dùng bộ nhớ tạm
const upload = multer({ storage });

// 🎯 Middleware xử lý upload ảnh
const uploadMiddleware = upload.single("img");

module.exports = { uploadMiddleware };
