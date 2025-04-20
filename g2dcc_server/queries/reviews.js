module.exports = {
  getProductReviews: `
      SELECT 
        r.*,
        u.username,
        u.img as "userImage"
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = $1 AND r.is_approved = true
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `,

  createReview: `
      INSERT INTO reviews (
        user_id, product_id, variant_id, rating, title, comment, is_buy
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `,

  getUserReviews: `
      SELECT 
        r.*,
        p.name as "productName",
        pv.color as "variantColor",
        (SELECT pi.image_url FROM product_images pi 
         WHERE pi.product_id = p.id 
         ORDER BY pi.is_primary DESC LIMIT 1) as "productImage"
      FROM reviews r
      JOIN products p ON r.product_id = p.id
      LEFT JOIN product_variants pv ON r.variant_id = pv.id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `,

  updateReview: `
      UPDATE reviews
      SET 
        rating = $1,
        title = $2,
        comment = $3,
        updated_at = NOW()
      WHERE id = $4 AND user_id = $5
      RETURNING *
    `,

  deleteReview: `
      DELETE FROM reviews
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `,

  getReviewStats: `
  SELECT 
    COUNT(*) as total,
    AVG(rating) as average,
    COUNT(*) FILTER (WHERE rating >= 4.5 AND rating <= 5) as five_star,
    COUNT(*) FILTER (WHERE rating >= 3.5 AND rating < 4.5) as four_star,
    COUNT(*) FILTER (WHERE rating >= 2.5 AND rating < 3.5) as three_star,
    COUNT(*) FILTER (WHERE rating >= 1.5 AND rating < 2.5) as two_star,
    COUNT(*) FILTER (WHERE rating >= 0.5 AND rating < 1.5) as one_star
  FROM reviews
  WHERE product_id = $1 AND is_approved = true
`,
};
