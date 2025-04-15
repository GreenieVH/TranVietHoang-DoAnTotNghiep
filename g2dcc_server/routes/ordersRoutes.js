const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orders");
const authMiddleware = require("../middlewares/authMiddleware");

// Protected routes
router.post("/", authMiddleware, orderController.createOrder);
router.get("/", authMiddleware, orderController.getUserOrders);
router.get("/:id", authMiddleware, orderController.getOrderById);

// Admin only routes
router.put(
  "/:id/status",
  authMiddleware,
  orderController.updateOrderStatus
);

module.exports = router;
