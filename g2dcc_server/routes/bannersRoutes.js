const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/banners');
const authMiddleware = require('../middlewares/authMiddleware');


// Public routes
router.get('/', bannerController.getAllBanners);
router.get('/:id', bannerController.getBannerById);

// Admin routes
router.post('/', authMiddleware, bannerController.createBanner);
router.put('/:id', authMiddleware, bannerController.updateBanner);
router.delete('/:id', authMiddleware, bannerController.deleteBanner);

module.exports = router;