const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brands');
const authMiddleware = require('../middlewares/authMiddleware');

// Public routes
router.get('/', brandController.getAllBrands);
router.get('/:id', brandController.getBrandById);
router.get('/:id/products', brandController.getBrandProducts);

// Admin routes
router.post('/', authMiddleware, brandController.createBrand);
router.put('/:id', authMiddleware, brandController.updateBrand);
router.delete('/:id', authMiddleware, brandController.deleteBrand);

module.exports = router;