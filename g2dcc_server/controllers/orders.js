const db = require('../config/db');
const orderQueries = require('../queries/orders');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  createOrder: async (req, res) => {
    try {
      const {
        total_amount,
        status,
        payment_method,
        shipping_address,
        billing_address,
        shipping_fee,
        tax_amount,
        discount_amount,
        final_price,
        note,
      } = req.body;

      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${uuidv4().slice(0, 8)}`;

      const result = await db.query(orderQueries.createOrder, [
        req.user.id,
        orderNumber,
        total_amount,
        status || "pending",
        "unpaid",
        payment_method,
        shipping_address,
        billing_address || shipping_address,
        shipping_fee || 0,
        tax_amount || 0,
        discount_amount || 0,
        final_price,
        note || null,
      ]);

      res.status(201).json({
        success: true,
        message: "Tạo đơn hàng thành công",
        data: result.rows[0],
      });
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi hệ thống",
      });
    }
  },

  addOrderItem: async (req, res) => {
    try {
      const { order_id, product_id, variant_id, quantity, unit_price } = req.body;

      const result = await db.query(orderQueries.addOrderItem, [
        order_id,
        product_id,
        variant_id,
        quantity,
        unit_price,
      ]);

      res.status(201).json({
        success: true,
        message: "Thêm sản phẩm vào đơn hàng thành công",
        data: result.rows[0],
      });
    } catch (error) {
      console.error("Error adding order item:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi hệ thống",
      });
    }
  },

  getUserOrders: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      // Get total count for pagination
      const countResult = await db.query(
        'SELECT COUNT(*) FROM orders WHERE user_id = $1',
        [req.user.id]
      );
      const total = parseInt(countResult.rows[0].count);

      const result = await db.query(orderQueries.getUserOrders, [
        req.user.id,
        limit,
        offset,
      ]);

      // Transform the response to match client needs
      const orders = result.rows.map(order => ({
        id: order.id,
        order_number: order.order_number,
        created_at: order.created_at,
        final_price: order.final_price,
        status: order.status
      }));

      res.json({
        data: {
          orders,
          pagination: {
            total,
            pages: Math.ceil(total / limit),
            current: parseInt(page),
            limit: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error("Error fetching user orders:", error);
      res.status(500).json({
        message: "Có lỗi xảy ra khi lấy danh sách đơn hàng"
      });
    }
  },

  getOrderById: async (req, res) => {
    try {
      const { id } = req.params;

      const result = await db.query(orderQueries.getOrderById, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy đơn hàng",
        });
      }

      // Check if user is authorized to view this order
      if (result.rows[0].user_id !== req.user.id && req.user?.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền xem đơn hàng này",
        });
      }

      res.json({
        success: true,
        message: "Lấy thông tin đơn hàng thành công",
        data: result.rows[0],
      });
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi hệ thống",
      });
    }
  },

  updateOrderStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Check if order exists
      const orderResult = await db.query(orderQueries.getOrderById, [id]);

      if (orderResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy đơn hàng",
        });
      }

      // Check if user is authorized to update this order
      if (orderResult.rows[0].user_id !== req.user.id && req.user?.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền cập nhật đơn hàng này",
        });
      }

      const result = await db.query(orderQueries.updateOrderStatus, [status, id]);

      res.json({
        success: true,
        message: "Cập nhật trạng thái đơn hàng thành công",
        data: result.rows[0],
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi hệ thống",
      });
    }
  },

  updateShipment: async (req, res) => {
    try {
      const { id } = req.params;
      const { carrier, tracking_number, status } = req.body;

      // Kiểm tra đầu vào
      if (!carrier || !tracking_number || !status || !id) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin: carrier, tracking_number, status hoặc id',
        });
      }

      // Check if order exists
      const orderResult = await db.query(orderQueries.getOrderById, [id]);

      if (orderResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy đơn hàng",
        });
      }

      // Check if user is authorized to update this order
      if (orderResult.rows[0].user_id !== req.user.id && req.user?.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền cập nhật đơn hàng này",
        });
      }

      // Check if shipment exists
      const shipmentResult = await db.query(
        'SELECT id FROM order_shipments WHERE order_id = $1',
        [id]
      );

      let result;
      if (shipmentResult.rows.length === 0) {
        // Create new shipment if not exists
        result = await db.query(orderQueries.createOrderShipment, [
          id,
          null, // shipping_method_id is optional
          carrier,
          tracking_number
        ]);
      } else {
        // Update existing shipment
        result = await db.query(orderQueries.updateShipment, [
          carrier,
          tracking_number,
          status,
          id,
        ]);
      }

      res.json({
        success: true,
        message: "Cập nhật thông tin vận chuyển thành công",
        data: result.rows[0],
      });
    } catch (error) {
      console.error("Error updating shipment:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi hệ thống",
      });
    }
  },

  getOrders: async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        status, 
        payment_status,
        startDate,
        endDate 
      } = req.query;
      const offset = (page - 1) * limit;

      const result = await db.query(orderQueries.getOrders, [
        status,
        payment_status,
        startDate,
        endDate,
        limit,
        offset,
      ]);

      // Get total count
      const countResult = await db.query(orderQueries.getOrdersCount, [
        status,
        payment_status,
        startDate,
        endDate,
      ]);
      const total = parseInt(countResult.rows[0].count, 10);

      res.json({
        success: true,
        message: "Lấy danh sách đơn hàng thành công",
        data: {
          orders: result.rows,
          pagination: {
            total,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            totalPages: Math.ceil(total / limit)
          }
        },
      });
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi hệ thống",
      });
    }
  },

  confirmDelivery: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Check if order exists
      const orderResult = await db.query(orderQueries.getOrderById, [id]);

      if (orderResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy đơn hàng",
        });
      }

      // Check if user is authorized to update this order
      if (orderResult.rows[0].user_id !== req.user.id && req.user?.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền cập nhật đơn hàng này",
        });
      }

      // Start transaction
      await db.query('BEGIN');

      try {
        // Update order status
        const result = await db.query(orderQueries.updateOrderStatus, [status, id]);

        // If order is delivered, update product stock
        if (status === 'delivered') {
          // Get all items in the order
          const orderItems = await db.query(
            'SELECT product_id, variant_id, quantity FROM order_items WHERE order_id = $1',
            [id]
          );

          // Update stock for each item
          for (const item of orderItems.rows) {
            if (item.variant_id) {
              // Update variant stock
              await db.query(
                'UPDATE product_variants SET stock = stock - $1 WHERE id = $2',
                [item.quantity, item.variant_id]
              );
            } else {
              // Update product stock
              await db.query(
                'UPDATE products SET stock = stock - $1 WHERE id = $2',
                [item.quantity, item.product_id]
              );
            }
          }
        }

        await db.query('COMMIT');

        res.json({
          success: true,
          message: "Xác nhận giao hàng thành công",
          data: result.rows[0],
        });
      } catch (error) {
        await db.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error("Error confirming delivery:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi hệ thống",
      });
    }
  },
};