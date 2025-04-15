const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotions');
const authMiddleware = require('../middlewares/authMiddleware');

// Public routes
router.get('/', promotionController.getAllPromotions);
router.get('/validate/:code', promotionController.validatePromotion);
router.get('/:id', promotionController.getPromotionById);

// Admin routes
router.post('/', authMiddleware, promotionController.createPromotion);
router.put('/:id', authMiddleware, promotionController.updatePromotion);
router.delete('/:id', authMiddleware, promotionController.deletePromotion);

module.exports = router;