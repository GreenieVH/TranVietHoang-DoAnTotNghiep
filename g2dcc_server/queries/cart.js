module.exports = {
  getCartByUser: `
  WITH cart_items AS (
    SELECT 
      cp.id,
      cp.product_id,
      cp.variant_id,
      cp.quantity,
      cp.price,
      p.name as product_name,
      (SELECT pi.image_url FROM product_images pi 
       WHERE pi.product_id = p.id 
       ORDER BY pi.is_primary DESC LIMIT 1) as product_image,
      pv.color as variant_color,
      COALESCE(pv.stock, p.stock) as stock,
      LEAST(COALESCE(pv.stock, p.stock), 10) as max_quantity
    FROM cart_products cp
    JOIN products p ON cp.product_id = p.id
    LEFT JOIN product_variants pv ON cp.variant_id = pv.id
    WHERE cp.cart_id = (SELECT id FROM cart WHERE user_id = $1)
  )
  SELECT 
    c.id as "cartId",
    COALESCE(
      (SELECT json_agg(json_build_object(
        'id', ci.id,
        'productId', ci.product_id,
        'variantId', ci.variant_id,
        'quantity', ci.quantity,
        'price', ci.price,
        'productName', ci.product_name,
        'productImage', ci.product_image,
        'variantColor', ci.variant_color,
        'stock', ci.stock,
        'maxQuantity', ci.max_quantity
      )) FROM cart_items ci),
      '[]'::json
    ) as items
  FROM cart c
  WHERE c.user_id = $1
`,
  
    addToCart: `
      INSERT INTO cart_products (cart_id, product_id, variant_id, quantity, price)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (cart_id, product_id, variant_id) 
      DO UPDATE SET quantity = cart_products.quantity + EXCLUDED.quantity
      RETURNING *
    `,
  
    updateCartItem: `
      UPDATE cart_products
      SET quantity = $1
      WHERE id = $2 AND cart_id = $3
      RETURNING *
    `,
  
    removeCartItem: `
      DELETE FROM cart_products
      WHERE id = $1 AND cart_id = $2
      RETURNING id
    `,
  
    clearCart: `
      DELETE FROM cart_products
      WHERE cart_id = $1
    `
  };