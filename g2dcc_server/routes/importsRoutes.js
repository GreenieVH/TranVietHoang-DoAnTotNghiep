const express = require('express');
const router = express.Router();
const importController = require('../controllers/imports');
const authMiddleware = require('../middlewares/authMiddleware');

// Public routes
router.get('/', authMiddleware, importController.getAllImports);
router.get('/:id', authMiddleware, importController.getImportById);
router.post('/', authMiddleware, importController.createImport);

module.exports = router;