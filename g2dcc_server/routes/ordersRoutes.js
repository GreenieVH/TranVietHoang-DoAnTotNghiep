const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orders");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

// User routes
router.post("/", authMiddleware, orderController.createOrder);
router.post("/items", authMiddleware, orderController.addOrderItem);
router.get("/user", authMiddleware, orderController.getUserOrders);
router.get("/:id", authMiddleware, orderController.getOrderById);

// Admin routes
router.get("/", authMiddleware, orderController.getOrders);
router.patch("/:id/status", authMiddleware, orderController.updateOrderStatus);
router.patch("/:id/shipment", authMiddleware, orderController.updateShipment);
router.put("/:id/status", authMiddleware, adminMiddleware, orderController.updateOrderStatus);
router.put("/:id/shipment", authMiddleware, adminMiddleware, orderController.updateShipment);
router.post("/:id/confirm-delivery", authMiddleware, orderController.confirmDelivery);

module.exports = router;
