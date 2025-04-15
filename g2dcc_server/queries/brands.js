module.exports = {
    getAllBrands: `
      SELECT * FROM brands 
      WHERE is_active = true
      ORDER BY name
    `,
  
    getBrandById: `
      SELECT b.*, 
        (SELECT COUNT(*) FROM products p 
         WHERE p.brand_id = b.id AND p.is_active = true) as product_count
      FROM brands b
      WHERE b.id = $1
    `,
  
    createBrand: `
      INSERT INTO brands (id, name, slug, description, logo_url, website_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
  
    updateBrand: `
      UPDATE brands
      SET 
        name = $1,
        description = $2,
        logo_url = $3,
        website_url = $4,
        is_active = $5,
        updated_at = NOW()
      WHERE id = $6
      RETURNING *
    `,
  
    deleteBrand: `
      DELETE FROM brands 
      WHERE id = $1
      RETURNING id
    `,
  
    checkBrandHasProducts: `
      SELECT 1 FROM products WHERE brand_id = $1 LIMIT 1
    `,
  
    getBrandProducts: `
      SELECT 
        p.id, p.name, p.slug, p.base_price, p.description,
        (SELECT pi.image_url FROM product_images pi 
         WHERE pi.product_id = p.id AND pi.is_primary = true LIMIT 1) as image_url,
        (SELECT AVG(r.rating) FROM reviews r 
         WHERE r.product_id = p.id AND r.is_approved = true) as rating
      FROM products p
      WHERE p.brand_id = $1 AND p.is_active = true
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `,
  
    countBrandProducts: `
      SELECT COUNT(*) FROM products 
      WHERE brand_id = $1 AND is_active = true
    `,
  
    checkBrandExists: `
      SELECT 1 FROM brands WHERE id = $1 AND is_active = true
    `
  };