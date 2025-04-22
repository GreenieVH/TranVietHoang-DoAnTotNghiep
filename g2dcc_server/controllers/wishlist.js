const db = require('../config/db');
const wishlistQueries = require('../queries/wishlist');

module.exports = {
  getWishlist: async (req, res) => {
    try {
      const userId = req.user?.id;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const result = await db.query(wishlistQueries.getUserWishlist, [
        userId, limit, offset
      ]);

      // Get total count
      const countResult = await db.query(
        'SELECT COUNT(*) FROM wishlist WHERE user_id = $1',
        [userId]
      );

      res.json({
        success: true,
        data: {
          items: result.rows,
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

  addToWishlist: async (req, res) => {
    try {
      const userId = req.user?.id;
      const { productId } = req.body;

      // Validate product
      const product = await db.query(
        'SELECT 1 FROM products WHERE id = $1 AND is_active = true',
        [productId]
      );

      if (product.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Product not found or inactive' 
        });
      }

      const result = await db.query(wishlistQueries.addToWishlist, [
        userId, productId
      ]);

      // If no rows returned, item already in wishlist
      if (result.rows.length === 0) {
        return res.status(200).json({ 
          success: true, 
          message: 'Product already in wishlist' 
        });
      }

      res.status(201).json({ 
        success: true, 
        data: result.rows[0] 
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  removeFromWishlist: async (req, res) => {
    try {
      const userId = req.user?.id;
      const { productId } = req.params;

      const result = await db.query(wishlistQueries.removeFromWishlist, [
        userId, productId
      ]);

      if (result.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Item not found in wishlist' 
        });
      }

      res.json({ 
        success: true, 
        message: 'Item removed from wishlist' 
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  checkInWishlist: async (req, res) => {
    try {
      const userId = req.user?.id;
      const { productId } = req.params;

      const result = await db.query(wishlistQueries.checkInWishlist, [
        userId, productId
      ]);

      res.json({ 
        success: true, 
        data: { inWishlist: result.rows.length > 0 } 
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
};