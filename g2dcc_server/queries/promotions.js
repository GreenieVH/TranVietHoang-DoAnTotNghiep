module.exports = {
    getAllPromotions: `
      SELECT * FROM promotions
      WHERE is_active = true AND start_date <= NOW()
      ORDER BY created_at DESC
    `,
  
    getPromotionById: `
      SELECT * FROM promotions
      WHERE id = $1
    `,
  
    createPromotion: `
      INSERT INTO promotions (
        code, name, description, discount_type, discount_value,
        max_discount_amount, min_order_amount, start_date, end_date,
        is_active, usage_limit
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `,
  
    updatePromotion: `
      UPDATE promotions
      SET 
        code = $1,
        name = $2,
        description = $3,
        discount_type = $4,
        discount_value = $5,
        max_discount_amount = $6,
        min_order_amount = $7,
        start_date = $8,
        end_date = $9,
        is_active = $10,
        usage_limit = $11
      WHERE id = $12
      RETURNING *
    `,
  
    deletePromotion: `
      DELETE FROM promotions
      WHERE id = $1
      RETURNING id
    `,
  
    validatePromotionCode: `
      SELECT * FROM promotions
      WHERE code = $1 
      AND is_active = true 
      AND start_date <= NOW() 
      AND end_date >= NOW()
      AND (usage_limit IS NULL OR used_count < usage_limit)
    `,
  
    incrementPromotionUsage: `
      UPDATE promotions
      SET used_count = used_count + 1
      WHERE id = $1
    `
  };