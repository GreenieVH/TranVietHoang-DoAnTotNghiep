module.exports = {
    getCartByUser: `
      SELECT 
        c.id as "cartId",
        json_agg(json_build_object(
          'id', cp.id,
          'productId', cp.product_id,
          'variantId', cp.variant_id,
          'quantity', cp.quantity,
          'price', cp.price,
          'productName', p.name,
          'productImage', (SELECT pi.image_url FROM product_images pi 
                           WHERE pi.product_id = p.id 
                           ORDER BY pi.is_primary DESC LIMIT 1),
          'variantColor', pv.color,
          'stock', COALESCE(pv.stock, p.stock),
          'maxQuantity', LEAST(COALESCE(pv.stock, p.stock), 10)
        )) as items
      FROM cart c
      LEFT JOIN cart_products cp ON c.id = cp.cart_id
      LEFT JOIN products p ON cp.product_id = p.id
      LEFT JOIN product_variants pv ON cp.variant_id = pv.id
      WHERE c.user_id = $1
      GROUP BY c.id
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