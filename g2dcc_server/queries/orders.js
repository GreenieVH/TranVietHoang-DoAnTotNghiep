module.exports = {
    createOrder: `
      INSERT INTO orders (
        user_id, order_number, total_amount, status, payment_status,
        payment_method, shipping_address, billing_address, shipping_fee,
        tax_amount, discount_amount, final_price, note
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `,
  
    addOrderItem: `
      INSERT INTO order_details (
        order_id, product_id, variant_id, quantity, price
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
  
    getUserOrders: `
      SELECT 
        o.*,
        (SELECT json_agg(json_build_object(
          'id', od.id,
          'productId', od.product_id,
          'variantId', od.variant_id,
          'quantity', od.quantity,
          'price', od.price,
          'productName', p.name,
          'variantColor', pv.color
        ))
        FROM order_details od
        LEFT JOIN products p ON od.product_id = p.id
        LEFT JOIN product_variants pv ON od.variant_id = pv.id
        WHERE od.order_id = o.id
      ) as items
      FROM orders o
      WHERE o.user_id = $1
      ORDER BY o.created_at DESC
      LIMIT $2 OFFSET $3
    `,
  
    getOrderById: `
      SELECT 
        o.*,
        (SELECT json_agg(json_build_object(
          'id', od.id,
          'productId', od.product_id,
          'variantId', od.variant_id,
          'quantity', od.quantity,
          'price', od.price,
          'productName', p.name,
          'productImage', (SELECT pi.image_url FROM product_images pi 
                           WHERE pi.product_id = p.id 
                           ORDER BY pi.is_primary DESC LIMIT 1),
          'variantColor', pv.color
        ))
        FROM order_details od
        LEFT JOIN products p ON od.product_id = p.id
        LEFT JOIN product_variants pv ON od.variant_id = pv.id
        WHERE od.order_id = o.id
      ) as items
      FROM orders o
      WHERE o.id = $1
    `,
  
    updateOrderStatus: `
      UPDATE orders
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `
  };