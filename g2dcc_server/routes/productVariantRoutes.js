const express = require('express');
const router = express.Router();
const controller = require('../controllers/productVariant');

// Get all variants for a product
router.get('/:productId/var', controller.getVariantsByProduct);

// Get single variant
router.get('/:id', controller.getVariant);

// Create new variant
router.post('/', controller.createVariant);

// Update variant
router.put('/:id', controller.updateVariant);

// Delete variant
router.delete('/:id', controller.deleteVariant);

// Set default variant
router.patch('/:productId/variants/:variantId/set-default', controller.setDefault);

module.exports = router;