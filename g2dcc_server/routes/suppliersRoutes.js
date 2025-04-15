const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/suppliers');
const authMiddleware = require('../middlewares/authMiddleware');

// Public routes
router.get('/', supplierController.getAllSuppliers);
router.get('/:id', supplierController.getSupplierById);

// Admin routes
router.post('/', authMiddleware, supplierController.createSupplier);
router.put('/:id', authMiddleware, supplierController.updateSupplier);
router.delete('/:id', authMiddleware, supplierController.deleteSupplier);

module.exports = router;