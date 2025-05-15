module.exports = {
  // Tạo log thay đổi tồn kho
  createInventoryLog: `
    INSERT INTO inventory_logs (
      product_id, variant_id, quantity_change, current_quantity,
      reference_type, reference_id, note, created_by
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `,

  // Lấy lịch sử tồn kho của sản phẩm
  getProductInventoryHistory: `
    SELECT 
      il.*,
      COALESCE(u.username, 'System') as created_by_name,
      CASE 
        WHEN il.reference_type = 'ORDER' THEN o.order_number
        ELSE il.reference_id::text
      END as reference_number,
      CASE 
        WHEN il.reference_type = 'ORDER' THEN 'Đơn hàng'
        WHEN il.reference_type = 'IMPORT' THEN 'Nhập hàng'
        WHEN il.reference_type = 'ADJUSTMENT' THEN 'Điều chỉnh'
        ELSE il.reference_type
      END as reference_type_name,
      p.name as product_name,
      pv.color as variant_color
    FROM inventory_logs il
    LEFT JOIN users u ON u.id = il.created_by
    LEFT JOIN orders o ON o.id = il.reference_id AND il.reference_type = 'ORDER'
    LEFT JOIN products p ON p.id = il.product_id
    LEFT JOIN product_variants pv ON pv.id = il.variant_id
    WHERE il.product_id = $1
    ORDER BY il.created_at DESC
  `,

  // Lấy lịch sử tồn kho của biến thể sản phẩm
  getVariantInventoryHistory: `
    SELECT 
      il.*,
      COALESCE(u.username, 'System') as created_by_name,
      CASE 
        WHEN il.reference_type = 'ORDER' THEN o.order_number
        ELSE il.reference_id::text
      END as reference_number,
      CASE 
        WHEN il.reference_type = 'ORDER' THEN 'Đơn hàng'
        WHEN il.reference_type = 'IMPORT' THEN 'Nhập hàng'
        WHEN il.reference_type = 'ADJUSTMENT' THEN 'Điều chỉnh'
        ELSE il.reference_type
      END as reference_type_name,
      p.name as product_name,
      pv.color as variant_color
    FROM inventory_logs il
    LEFT JOIN users u ON u.id = il.created_by
    LEFT JOIN orders o ON o.id = il.reference_id AND il.reference_type = 'ORDER'
    LEFT JOIN products p ON p.id = il.product_id
    LEFT JOIN product_variants pv ON pv.id = il.variant_id
    WHERE il.variant_id = $1
    ORDER BY il.created_at DESC
  `,

  // Lấy tổng số lượng thay đổi theo loại tham chiếu
  getInventoryChangesByReference: `
    SELECT 
      reference_type,
      SUM(quantity_change) as total_change
    FROM inventory_logs
    WHERE product_id = $1
    AND created_at >= $2
    AND created_at <= $3
    GROUP BY reference_type
  `,

  // Lấy số lượng tồn kho hiện tại
  getCurrentInventory: `
    SELECT 
      p.id as product_id,
      p.name as product_name,
      p.stock as product_stock,
      pv.id as variant_id,
      pv.color as variant_color,
      pv.stock as variant_stock
    FROM products p
    LEFT JOIN product_variants pv ON pv.product_id = p.id
    WHERE p.id = $1
  `,

  // Lấy tất cả lịch sử tồn kho
  getAllInventoryHistory: `
    SELECT 
      il.*,
      COALESCE(u.username, 'System') as created_by_name,
      CASE 
        WHEN il.reference_type = 'ORDER' THEN o.order_number
        ELSE il.reference_id::text
      END as reference_number,
      CASE 
        WHEN il.reference_type = 'ORDER' THEN 'Đơn hàng'
        WHEN il.reference_type = 'IMPORT' THEN 'Nhập hàng'
        WHEN il.reference_type = 'ADJUSTMENT' THEN 'Điều chỉnh'
        ELSE il.reference_type
      END as reference_type_name,
      p.name as product_name,
      pv.color as variant_color
    FROM inventory_logs il
    LEFT JOIN users u ON u.id = il.created_by
    LEFT JOIN orders o ON o.id = il.reference_id AND il.reference_type = 'ORDER'
    LEFT JOIN products p ON p.id = il.product_id
    LEFT JOIN product_variants pv ON pv.id = il.variant_id
    ORDER BY il.created_at DESC
  `
}; 