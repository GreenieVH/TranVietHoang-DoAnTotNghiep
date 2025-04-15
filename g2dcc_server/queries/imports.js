module.exports = {
    getAllImports: `
      SELECT 
        ip.*,
        s.name as "supplierName",
        p.name as "productName",
        pv.color as "variantColor",
        u.username as "importedByName"
      FROM import_products ip
      LEFT JOIN suppliers s ON ip.supplier_id = s.id
      LEFT JOIN products p ON ip.product_id = p.id
      LEFT JOIN product_variants pv ON ip.variant_id = pv.id
      LEFT JOIN users u ON ip.imported_by = u.id
      ORDER BY ip.import_date DESC
      LIMIT $1 OFFSET $2
    `,
  
    getImportById: `
      SELECT 
        ip.*,
        s.name as "supplierName",
        p.name as "productName",
        pv.color as "variantColor",
        u.username as "importedByName"
      FROM import_products ip
      LEFT JOIN suppliers s ON ip.supplier_id = s.id
      LEFT JOIN products p ON ip.product_id = p.id
      LEFT JOIN product_variants pv ON ip.variant_id = pv.id
      LEFT JOIN users u ON ip.imported_by = u.id
      WHERE ip.id = $1
    `,
  
    createImport: `
      INSERT INTO import_products (
        product_id, variant_id, quantity, unit_price, 
        supplier_id, imported_by, note, import_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `,
  
    updateStock: `
      UPDATE product_variants
      SET stock = stock + $1
      WHERE id = $2
    `
  };