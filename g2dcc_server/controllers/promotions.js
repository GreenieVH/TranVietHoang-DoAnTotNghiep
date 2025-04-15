const db = require('../config/db');
const promotionQueries = require('../queries/promotions');

module.exports = {
  getAllPromotions: async (req, res) => {
    try {
      const result = await db.query(promotionQueries.getAllPromotions);
      res.json({ success: true, data: result.rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  getPromotionById: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await db.query(promotionQueries.getPromotionById, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Promotion not found' });
      }

      res.json({ success: true, data: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  createPromotion: async (req, res) => {
    try {
      const {
        code, name, description, discountType, discountValue,
        maxDiscountAmount, minOrderAmount, startDate, endDate,
        isActive, usageLimit
      } = req.body;

      // Validate dates
      if (new Date(startDate) >= new Date(endDate)) {
        return res.status(400).json({ 
          success: false, 
          message: 'End date must be after start date' 
        });
      }

      const result = await db.query(promotionQueries.createPromotion, [
        code, name, description, discountType, discountValue,
        maxDiscountAmount || null, minOrderAmount || 0, 
        startDate, endDate, isActive !== false, usageLimit || null
      ]);

      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
      console.error(err);
      if (err.code === '23505') {
        return res.status(400).json({ 
          success: false, 
          message: 'Promotion code already exists' 
        });
      }
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  updatePromotion: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        code, name, description, discountType, discountValue,
        maxDiscountAmount, minOrderAmount, startDate, endDate,
        isActive, usageLimit
      } = req.body;

      // Validate dates
      if (new Date(startDate) >= new Date(endDate)) {
        return res.status(400).json({ 
          success: false, 
          message: 'End date must be after start date' 
        });
      }

      const result = await db.query(promotionQueries.updatePromotion, [
        code, name, description, discountType, discountValue,
        maxDiscountAmount || null, minOrderAmount || 0, 
        startDate, endDate, isActive !== false, usageLimit || null,
        id
      ]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Promotion not found' });
      }

      res.json({ success: true, data: result.rows[0] });
    } catch (err) {
      console.error(err);
      if (err.code === '23505') {
        return res.status(400).json({ 
          success: false, 
          message: 'Promotion code already exists' 
        });
      }
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  deletePromotion: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await db.query(promotionQueries.deletePromotion, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Promotion not found' });
      }

      res.json({ success: true, message: 'Promotion deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
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
          message: 'Invalid or expired promotion code' 
        });
      }

      const promotion = result.rows[0];

      // Check minimum order amount
      if (totalAmount && promotion.min_order_amount > parseFloat(totalAmount)) {
        return res.status(400).json({
          success: false,
          message: `Minimum order amount for this promotion is ${promotion.min_order_amount}`
        });
      }

      res.json({ success: true, data: promotion });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
};