module.exports = {
    getAllCategories: `
      SELECT c.*, 
        (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.is_active = true) as product_count
      FROM categories c
      WHERE c.is_active = true
      ORDER BY c.name
    `,
  
    getCategoryById: `
      SELECT c.*, 
        (SELECT json_agg(json_build_object('id', p.id, 'name', p.name, 'slug', p.slug, 'basePrice', p.base_price))
         FROM products p 
         WHERE p.category_id = c.id AND p.is_active = true
         LIMIT 10) as products
      FROM categories c
      WHERE c.id = $1 AND c.is_active = true
    `,
  
    createCategory: `
      INSERT INTO categories (name, description, parent_id, is_active, slug)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
  
    updateCategory: `
      UPDATE categories
      SET name = $1, description = $2, parent_id = $3, slug = $4, updated_at = NOW()
      WHERE id = $5 AND is_active = true
      RETURNING *
    `,
  
    deleteCategory: `
      UPDATE categories
      SET is_active = false, updated_at = NOW()
      WHERE id = $1
      RETURNING id
    `
  };