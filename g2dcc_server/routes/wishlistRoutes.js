const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlist');
const authMiddleware = require('../middlewares/authMiddleware');

// Protected routes

router.get('/', authMiddleware, wishlistController.getWishlist);
router.post('/', authMiddleware, wishlistController.addToWishlist);
router.delete('/:productId', authMiddleware, wishlistController.removeFromWishlist);
router.get('/check/:productId', authMiddleware, wishlistController.checkInWishlist);

module.exports = router;