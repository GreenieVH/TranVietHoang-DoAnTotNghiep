const express = require('express');
const router = express.Router();
const productController = require('../controllers/products');

// Public routes
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

// Protected routes (require admin role)
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

// Variant routes
router.post('/:productId/variants', productController.createVariant);

// Image routes
router.post('/:productId/images', productController.addImage);

module.exports = router;