const express = require("express");
const router = express.Router();
const productController = require("../controllers/products");
const { uploadImageMiddleware } = require("../middlewares/uploadMiddleware");
const authenticateToken = require("../middlewares/authMiddleware");

// Public routes
router.get("/", productController.getProducts);

// Inventory routes (require auth)
router.get("/inventory-history", authenticateToken, productController.getAllInventoryHistory);
router.get("/:productId/inventory-history", authenticateToken, productController.getInventoryHistory);
router.get("/:productId/variants/:variantId/inventory-history", authenticateToken, productController.getInventoryHistory);

// Product routes
router.get("/:id([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})", productController.getProductById);

// Product management routes (require auth)
router.post("/", authenticateToken, uploadImageMiddleware, productController.createProduct);
router.put("/:id", authenticateToken, uploadImageMiddleware, productController.updateProduct);
router.delete("/:id", authenticateToken, productController.deleteProduct);

// Variant routes (require auth)
router.post("/:productId/variants", authenticateToken, productController.createVariant);

// Image routes (require auth)
router.post("/:productId/images", authenticateToken, productController.addImage);

module.exports = router;
