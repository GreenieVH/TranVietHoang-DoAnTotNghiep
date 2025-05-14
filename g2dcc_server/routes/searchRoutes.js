const express = require('express');
const router = express.Router();
const { userSearch, adminSearch } = require('../controllers/searchController');
const AuthMiddleware = require('../middlewares/authMiddleware');

// Route tìm kiếm cho user (không cần đăng nhập)
router.get('/user', userSearch);

// Route tìm kiếm cho admin/staff (cần đăng nhập)
router.get('/admin', AuthMiddleware, adminSearch);

module.exports = router;