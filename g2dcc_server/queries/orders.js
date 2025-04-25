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
      INSERT INTO order_items (
        order_id, product_id, variant_id, quantity, unit_price
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
  
    createOrderShipment: `
      INSERT INTO order_shipments (
        order_id, shipping_method_id, carrier, tracking_number
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
  
    getUserOrders: `
      SELECT 
        o.*,
        (SELECT json_agg(json_build_object(
          'id', oi.id,
          'productId', oi.product_id,
          'variantId', oi.variant_id,
          'quantity', oi.quantity,
          'unit_price', oi.unit_price,
          'productName', p.name,
          'variantColor', pv.color
        ))
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        LEFT JOIN product_variants pv ON oi.variant_id = pv.id
        WHERE oi.order_id = o.id
      ) as items,
      (SELECT json_build_object(
        'id', os.id,
        'carrier', os.carrier,
        'trackingNumber', os.tracking_number,
        'status', os.status,
        'shippedAt', os.shipped_at,
        'deliveredAt', os.delivered_at
      )
      FROM order_shipments os
      WHERE os.order_id = o.id
      LIMIT 1) as shipment
      FROM orders o
      WHERE o.user_id = $1
      ORDER BY o.created_at DESC
      LIMIT $2 OFFSET $3
    `,
  
    getOrderById: `
      SELECT 
        o.*,
        (SELECT json_agg(json_build_object(
          'id', oi.id,
          'productId', oi.product_id,
          'variantId', oi.variant_id,
          'quantity', oi.quantity,
          'unit_price', oi.unit_price,
          'productName', p.name,
          'productImage', (SELECT image_url FROM product_images 
                           WHERE product_id = p.id 
                           ORDER BY is_primary DESC LIMIT 1),
          'variantColor', pv.color
        ))
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        LEFT JOIN product_variants pv ON oi.variant_id = pv.id
        WHERE oi.order_id = o.id
      ) as items,
      (SELECT json_build_object(
        'id', os.id,
        'carrier', os.carrier,
        'trackingNumber', os.tracking_number,
        'status', os.status,
        'shippedAt', os.shipped_at,
        'deliveredAt', os.delivered_at
      )
      FROM order_shipments os
      WHERE os.order_id = o.id
      LIMIT 1) as shipment
      FROM orders o
      WHERE o.id = $1
    `,
  
    updateOrderStatus: `
      UPDATE orders
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `,
  
    updateShipmentStatus: `
      UPDATE order_shipments
      SET status = $1, 
          CASE 
            WHEN $1 = 'shipped' THEN shipped_at = NOW()
            WHEN $1 = 'delivered' THEN delivered_at = NOW()
          END,
          updated_at = NOW()
      WHERE order_id = $2
      RETURNING *
    `,
  
    getOrders: `
      SELECT 
        o.*,
        json_build_object(
          'id', u.id,
          'username', u.username,
          'email', u.email
        ) as user,
        (SELECT json_agg(json_build_object(
          'id', oi.id,
          'productId', oi.product_id,
          'variantId', oi.variant_id,
          'quantity', oi.quantity,
          'unit_price', oi.unit_price,
          'productName', p.name,
          'productImage', (SELECT image_url FROM product_images 
                           WHERE product_id = p.id 
                           ORDER BY is_primary DESC LIMIT 1),
          'variantColor', pv.color
        ))
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        LEFT JOIN product_variants pv ON oi.variant_id = pv.id
        WHERE oi.order_id = o.id
      ) as items,
      (SELECT json_build_object(
        'id', os.id,
        'carrier', os.carrier,
        'trackingNumber', os.tracking_number,
        'status', os.status,
        'shippedAt', os.shipped_at,
        'deliveredAt', os.delivered_at
      )
      FROM order_shipments os
      WHERE os.order_id = o.id
      LIMIT 1) as shipment
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE ($1::text IS NULL OR o.status = $1)
      AND ($2::text IS NULL OR o.payment_status = $2)
      ORDER BY o.created_at DESC
      LIMIT $3 OFFSET $4
    `,
    getOrdersCount: `
  SELECT COUNT(*) 
  FROM orders o
  WHERE ($1::text IS NULL OR o.status = $1)
  AND ($2::text IS NULL OR o.payment_status = $2)
`
  };