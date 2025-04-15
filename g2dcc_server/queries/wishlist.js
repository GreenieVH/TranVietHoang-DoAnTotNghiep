module.exports = {
    getUserWishlist: `
      SELECT 
        w.id,
        p.id as "productId",
        p.name,
        p.slug,
        p.base_price as "basePrice",
        (SELECT pi.image_url FROM product_images pi 
         WHERE pi.product_id = p.id 
         ORDER BY pi.is_primary DESC LIMIT 1) as "imageUrl",
        (SELECT COUNT(*) FROM product_variants pv 
         WHERE pv.product_id = p.id AND pv.stock > 0) > 0 as "inStock"
      FROM wishlist w
      JOIN products p ON w.product_id = p.id
      WHERE w.user_id = $1
      ORDER BY w.created_at DESC
      LIMIT $2 OFFSET $3
    `,
  
    addToWishlist: `
      INSERT INTO wishlist (user_id, product_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, product_id) DO NOTHING
      RETURNING *
    `,
  
    removeFromWishlist: `
      DELETE FROM wishlist
      WHERE user_id = $1 AND product_id = $2
      RETURNING id
    `,
  
    checkInWishlist: `
      SELECT 1 FROM wishlist
      WHERE user_id = $1 AND product_id = $2
    `
  };