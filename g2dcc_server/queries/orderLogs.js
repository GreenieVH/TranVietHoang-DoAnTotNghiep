module.exports = {
  // Tạo log cho order
  createOrderLog: `
    INSERT INTO order_logs (
      order_id,
      status,
      note,
      created_by
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `,

  // Lấy lịch sử log của một order
  getOrderLogs: `
    SELECT 
      ol.*,
      u.username as created_by_name,
      CASE 
        WHEN ol.status = 'pending' THEN 'Chờ xử lý'
        WHEN ol.status = 'processing' THEN 'Đang xử lý'
        WHEN ol.status = 'shipped' THEN 'Đang giao hàng'
        WHEN ol.status = 'delivered' THEN 'Đã giao hàng'
        WHEN ol.status = 'cancelled' THEN 'Đã hủy'
        ELSE ol.status
      END as status_name
    FROM order_logs ol
    LEFT JOIN users u ON u.id = ol.created_by
    WHERE ol.order_id = $1
    ORDER BY ol.created_at DESC
  `,

  // Lấy tất cả logs của tất cả orders
  getAllOrderLogs: `
    SELECT 
      ol.*,
      u.username as created_by_name,
      o.order_number,
      CASE 
        WHEN ol.status = 'pending' THEN 'Chờ xử lý'
        WHEN ol.status = 'processing' THEN 'Đang xử lý'
        WHEN ol.status = 'shipped' THEN 'Đang giao hàng'
        WHEN ol.status = 'delivered' THEN 'Đã giao hàng'
        WHEN ol.status = 'cancelled' THEN 'Đã hủy'
        ELSE ol.status
      END as status_name
    FROM order_logs ol
    LEFT JOIN users u ON u.id = ol.created_by
    LEFT JOIN orders o ON o.id = ol.order_id
    ORDER BY ol.created_at DESC
  `
}; 