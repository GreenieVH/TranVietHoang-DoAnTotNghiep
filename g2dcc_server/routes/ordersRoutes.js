const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orders");
const authenticateToken = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

// Public routes (require auth)
router.post("/", authenticateToken, orderController.createOrder);
router.post("/items", authenticateToken, orderController.addOrderItem);
router.get("/my-orders", authenticateToken, orderController.getUserOrders);

// Order logs routes (require auth)
router.get("/logs", authenticateToken, orderController.getAllOrderLogs);
router.get("/:orderId/logs", authenticateToken, orderController.getOrderLogs);

// Order detail routes (require auth)
router.get("/:id([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})", authenticateToken, orderController.getOrderById);

// Admin routes (require auth)
router.get("/", authenticateToken, orderController.getOrders);
router.put("/:id/status", authenticateToken, orderController.updateOrderStatus);
router.put("/:id/shipment", authenticateToken, orderController.updateShipment);
router.put("/:id/confirm-delivery", authenticateToken, orderController.confirmDelivery);

module.exports = router;
