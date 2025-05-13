const db = require('../config/db');
const promotionQueries = require('../queries/promotions');

module.exports = {
  getAllPromotions: async (req, res) => {
    try {
      const result = await db.query(promotionQueries.getAllPromotions);
      res.json({ success: true, data: result.rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
  },

  getPromotionById: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await db.query(promotionQueries.getPromotionById, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy mã giảm giá' });
      }

      res.json({ success: true, data: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
  },

  createPromotion: async (req, res) => {
    try {
      const {
        code, name, description, discount_type, discount_value,
        max_discount_amount, min_order_amount, start_date, end_date,
        is_active, usage_limit
      } = req.body;

      // Validate dates
      if (new Date(start_date) >= new Date(end_date)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Ngày kết thúc phải sau ngày bắt đầu' 
        });
      }

      const result = await db.query(promotionQueries.createPromotion, [
        code, name, description, discount_type, discount_value,
        max_discount_amount || null, min_order_amount || 0, 
        start_date, end_date, is_active !== false, usage_limit || null
      ]);

      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
      console.error(err);
      if (err.code === '23505') {
        return res.status(400).json({ 
          success: false, 
          message: 'Mã giảm giá đã tồn tại' 
        });
      }
      res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
  },

  updatePromotion: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        code, name, description, discount_type, discount_value,
        max_discount_amount, min_order_amount, start_date, end_date,
        is_active, usage_limit
      } = req.body;

      // Validate dates
      if (new Date(start_date) >= new Date(end_date)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Ngày kết thúc phải sau ngày bắt đầu' 
        });
      }

      const result = await db.query(promotionQueries.updatePromotion, [
        code, name, description, discount_type, discount_value,
        max_discount_amount || null, min_order_amount || 0, 
        start_date, end_date, is_active !== false, usage_limit || null,
        id
      ]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy mã giảm giá' });
      }

      res.json({ success: true, data: result.rows[0] });
    } catch (err) {
      console.error(err);
      if (err.code === '23505') {
        return res.status(400).json({ 
          success: false, 
          message: 'Mã giảm giá đã tồn tại' 
        });
      }
      res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
  },

  deletePromotion: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await db.query(promotionQueries.deletePromotion, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy mã giảm giá' });
      }

      res.json({ success: true, message: 'Xóa mã giảm giá thành công' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
  },

  validatePromotion: async (req, res) => {
    try {
      const { code } = req.params;
      const { totalAmount } = req.query;

      const result = await db.query(promotionQueries.validatePromotionCode, [code]);

      if (result.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Mã giảm giá không hợp lệ hoặc đã hết hạn' 
        });
      }

      const promotion = result.rows[0];

      // Check minimum order amount
      if (totalAmount && promotion.min_order_amount > parseFloat(totalAmount)) {
        return res.status(400).json({
          success: false,
          message: `Đơn hàng tối thiểu cho mã này là ${promotion.min_order_amount} VNĐ`
        });
      }

      res.json({ success: true, data: promotion });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
  }
};