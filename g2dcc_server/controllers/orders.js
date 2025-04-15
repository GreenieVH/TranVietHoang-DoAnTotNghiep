const db = require('../config/db');
const orderQueries = require('../queries/orders');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  createOrder: async (req, res) => {
    try {
      const { userId } = req;
      const {
        items,
        shippingAddress,
        billingAddress,
        paymentMethod,
        note,
        promotionId
      } = req.body;

      // Calculate totals
      let totalAmount = 0;
      let discountAmount = 0;
      let shippingFee = 0; // Could be calculated based on address
      let taxAmount = 0; // Could be calculated based on location

      // Validate items and calculate total
      for (const item of items) {
        const product = await db.query(
          'SELECT base_price FROM products WHERE id = $1 AND is_active = true',
          [item.productId]
        );

        if (product.rows.length === 0) {
          return res.status(400).json({
            success: false,
            message: `Product ${item.productId} not found or inactive`
          });
        }

        let price = product.rows[0].base_price;

        // Check variant if provided
        if (item.variantId) {
          const variant = await db.query(
            'SELECT price FROM product_variants WHERE id = $1',
            [item.variantId]
          );

          if (variant.rows.length > 0) {
            price = variant.rows[0].price;
          }
        }

        totalAmount += price * item.quantity;
      }

      // Apply promotion if available
      if (promotionId) {
        const promotion = await db.query(
          'SELECT discount_value, discount_type FROM promotions WHERE id = $1 AND is_active = true AND start_date <= NOW() AND end_date >= NOW()',
          [promotionId]
        );

        if (promotion.rows.length > 0) {
          const promo = promotion.rows[0];
          if (promo.discount_type === 'percentage') {
            discountAmount = totalAmount * (promo.discount_value / 100);
          } else {
            discountAmount = promo.discount_value;
          }
        }
      }

      const finalPrice = totalAmount + shippingFee + taxAmount - discountAmount;

      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${uuidv4().split('-')[0]}`;

      // Create order
      const orderResult = await db.query(orderQueries.createOrder, [
        userId,
        orderNumber,
        totalAmount,
        'pending',
        'unpaid',
        paymentMethod,
        shippingAddress,
        billingAddress,
        shippingFee,
        taxAmount,
        discountAmount,
        finalPrice,
        note || null
      ]);

      const order = orderResult.rows[0];

      // Add order items
      for (const item of items) {
        await db.query(orderQueries.addOrderItem, [
          order.id,
          item.productId,
          item.variantId || null,
          item.quantity,
          item.price
        ]);

        // Update stock
        if (item.variantId) {
          await db.query(
            'UPDATE product_variants SET stock = stock - $1 WHERE id = $2',
            [item.quantity, item.variantId]
          );
        } else {
          await db.query(
            'UPDATE products SET stock = stock - $1 WHERE id = $2',
            [item.quantity, item.productId]
          );
        }
      }

      res.status(201).json({ success: true, data: order });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  getUserOrders: async (req, res) => {
    try {
      const { userId } = req;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const result = await db.query(orderQueries.getUserOrders, [userId, limit, offset]);

      // Get total count
      const countResult = await db.query(
        'SELECT COUNT(*) FROM orders WHERE user_id = $1',
        [userId]
      );

      res.json({
        success: true,
        data: {
          orders: result.rows,
          pagination: {
            total: parseInt(countResult.rows[0].count, 10),
            page: parseInt(page, 10),
            pages: Math.ceil(countResult.rows[0].count / limit),
            limit: parseInt(limit, 10)
          }
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  getOrderById: async (req, res) => {
    try {
      const { id } = req.params;
      const { userId, userRole } = req;

      let query = orderQueries.getOrderById;
      let params = [id];

      // For non-admin users, restrict to their own orders
      if (userRole !== 'admin') {
        query = query + ' AND user_id = $2';
        params.push(userId);
      }

      const result = await db.query(query, params);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      res.json({ success: true, data: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  updateOrderStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid status value' 
        });
      }

      const result = await db.query(orderQueries.updateOrderStatus, [status, id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      res.json({ success: true, data: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
};