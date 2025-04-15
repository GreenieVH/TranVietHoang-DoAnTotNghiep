module.exports = {
    getAllSuppliers: `
      SELECT * FROM suppliers
      WHERE is_active = true
      ORDER BY name
    `,
  
    getSupplierById: `
      SELECT * FROM suppliers
      WHERE id = $1
    `,
  
    createSupplier: `
      INSERT INTO suppliers (
        name, address, email, phone, tax_code, 
        contact_person, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `,
  
    updateSupplier: `
      UPDATE suppliers
      SET 
        name = $1,
        address = $2,
        email = $3,
        phone = $4,
        tax_code = $5,
        contact_person = $6,
        is_active = $7,
        updated_at = NOW()
      WHERE id = $8
      RETURNING *
    `,
  
    deleteSupplier: `
      UPDATE suppliers
      SET is_active = false, updated_at = NOW()
      WHERE id = $1
      RETURNING id
    `
  };