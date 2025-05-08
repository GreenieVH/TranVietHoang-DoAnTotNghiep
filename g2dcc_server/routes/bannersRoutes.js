const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/banners');
const authMiddleware = require('../middlewares/authMiddleware');
const { uploadBannerMiddleware } = require('../middlewares/uploadMiddleware');

// Public routes
router.get('/', bannerController.getAllBanners);
router.get('/:id', bannerController.getBannerById);

// Admin routes (protected)
router.post('/', authMiddleware, uploadBannerMiddleware, bannerController.createBanner);
router.put('/:id', authMiddleware, uploadBannerMiddleware, bannerController.updateBanner);
router.delete('/:id', authMiddleware, bannerController.deleteBanner);

module.exports = router;