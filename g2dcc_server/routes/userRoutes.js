const express = require("express");
const {
  getProfile,
  getAllUser,
  updateUser,
  getUserStats,
} = require("../controllers/userController");
const authenticateToken = require("../middlewares/authMiddleware");
const { uploadMiddleware } = require("../middlewares/uploadMiddleware");

const router = express.Router();

router.get("/profile", authenticateToken, getProfile);
router.get("/stats", getUserStats);
router.get("/all", authenticateToken, getAllUser);
router.put("/updateduser/:id", authenticateToken, uploadMiddleware, updateUser);

module.exports = router;
