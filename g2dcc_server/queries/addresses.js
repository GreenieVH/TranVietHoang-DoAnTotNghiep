module.exports = {
    getUserAddresses: `
      SELECT * FROM address
      WHERE user_id = $1
      ORDER BY is_default DESC, created_at DESC
    `,
  
    getAddressById: `
      SELECT * FROM address
      WHERE id = $1 AND user_id = $2
    `,
  
    createAddress: `
      INSERT INTO address (
        user_id, recipient_name, phone_number, address_line1,
        address_line2, city, state, postal_code, country, is_default
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `,
  
    updateAddress: `
      UPDATE address
      SET 
        recipient_name = $1,
        phone_number = $2,
        address_line1 = $3,
        address_line2 = $4,
        city = $5,
        state = $6,
        postal_code = $7,
        country = $8,
        is_default = $9,
        updated_at = NOW()
      WHERE id = $10 AND user_id = $11
      RETURNING *
    `,
  
    deleteAddress: `
      DELETE FROM address
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `,
  
    clearDefaultAddresses: `
      UPDATE address
      SET is_default = false
      WHERE user_id = $1
    `
  };