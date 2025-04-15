const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addresses');
const authMiddleware = require('../middlewares/authMiddleware');

// Protected routes
router.get('/', authMiddleware, addressController.getUserAddresses);
router.get('/:id', authMiddleware, addressController.getAddressById);
router.post('/', authMiddleware, addressController.createAddress);
router.put('/:id', authMiddleware, addressController.updateAddress);
router.delete('/:id', authMiddleware, addressController.deleteAddress);

module.exports = router;