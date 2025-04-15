const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart");
const authMiddleware = require("../middlewares/authMiddleware");

// Protected routes
router.get("/", authMiddleware, cartController.getCart);
router.post("/items", authMiddleware, cartController.addToCart);
router.put("/items/:itemId", authMiddleware, cartController.updateCartItem);
router.delete("/items/:itemId", authMiddleware, cartController.removeCartItem);
router.delete("/", authMiddleware, cartController.clearCart);

module.exports = router;
