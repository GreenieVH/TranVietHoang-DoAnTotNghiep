const db = require('../config/db');
const reviewQueries = require('../queries/reviews');

module.exports = {
  getProductReviews: async (req, res) => {
    try {
      const { productId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      // Get reviews
      const reviewsResult = await db.query(reviewQueries.getProductReviews, [
        productId, limit, offset
      ]);

      // Get review stats
      const statsResult = await db.query(reviewQueries.getReviewStats, [productId]);

      res.json({
        success: true,
        data: {
          reviews: reviewsResult.rows,
          stats: statsResult.rows[0],
          pagination: {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10)
          }
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  createReview: async (req, res) => {
    try {
      const { userId } = req;
      const { productId, variantId, rating, title, comment } = req.body;

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

      // Validate variant if provided
      if (variantId) {
        const variant = await db.query(
          'SELECT 1 FROM product_variants WHERE id = $1',
          [variantId]
        );

        if (variant.rows.length === 0) {
          return res.status(404).json({ 
            success: false, 
            message: 'Variant not found' 
          });
        }
      }

      // Check if user has purchased the product (optional)
      const hasPurchased = await db.query(
        `SELECT 1 FROM order_details od
         JOIN orders o ON od.order_id = o.id
         WHERE o.user_id = $1 AND od.product_id = $2
         LIMIT 1`,
        [userId, productId]
      );

      const isBuy = hasPurchased.rows.length > 0;

      // Create review
      const result = await db.query(reviewQueries.createReview, [
        userId, productId, variantId || null, 
        rating, title || null, comment || null, isBuy
      ]);

      // Update product average rating (could be done with a trigger)
      await db.query(
        `UPDATE products 
         SET rating = (
           SELECT AVG(rating) FROM reviews 
           WHERE product_id = $1 AND is_approved = true
         )
         WHERE id = $1`,
        [productId]
      );

      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  getUserReviews: async (req, res) => {
    try {
      const { userId } = req;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const result = await db.query(reviewQueries.getUserReviews, [
        userId, limit, offset
      ]);

      // Get total count
      const countResult = await db.query(
        'SELECT COUNT(*) FROM reviews WHERE user_id = $1',
        [userId]
      );

      res.json({
        success: true,
        data: {
          reviews: result.rows,
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

  updateReview: async (req, res) => {
    try {
      const { userId } = req;
      const { reviewId } = req.params;
      const { rating, title, comment } = req.body;

      const result = await db.query(reviewQueries.updateReview, [
        rating, title || null, comment || null, reviewId, userId
      ]);

      if (result.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Review not found or not owned by user' 
        });
      }

      // Update product average rating
      await db.query(
        `UPDATE products 
         SET rating = (
           SELECT AVG(rating) FROM reviews 
           WHERE product_id = $1 AND is_approved = true
         )
         WHERE id = (
           SELECT product_id FROM reviews WHERE id = $2
         )`,
        [result.rows[0].product_id, reviewId]
      );

      res.json({ success: true, data: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  deleteReview: async (req, res) => {
    try {
      const { userId } = req;
      const { reviewId } = req.params;

      // First get product_id for updating average later
      const review = await db.query(
        'SELECT product_id FROM reviews WHERE id = $1',
        [reviewId]
      );

      if (review.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Review not found' 
        });
      }

      const productId = review.rows[0].product_id;

      // Delete review
      const result = await db.query(reviewQueries.deleteReview, [
        reviewId, userId
      ]);

      if (result.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Review not found or not owned by user' 
        });
      }

      // Update product average rating
      await db.query(
        `UPDATE products 
         SET rating = (
           SELECT AVG(rating) FROM reviews 
           WHERE product_id = $1 AND is_approved = true
         )
         WHERE id = $1`,
        [productId]
      );

      res.json({ success: true, message: 'Review deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
};