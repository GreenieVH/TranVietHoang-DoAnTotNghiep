module.exports = {
  // Lấy danh sách sản phẩm với phân trang và lọc
  getProducts: (filters) => {
    const {
      page = 1,
      limit = 10,
      category,
      brand_id,
      minPrice,
      maxPrice,
      sort = "newest",
      search,
      inStock,
    } = filters;

    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        p.id, p.name, p.slug, p.brand_id, p.base_price as "basePrice",
        p.description, p.stock, p.created_at as "createdAt",
        p.updated_at as "updatedAt", p.is_active as "isActive",
        c.id as "categoryId", c.name as "categoryName",
        b.name as "brandName", b.logo_url as "brandLogo",
        (
          SELECT json_agg(json_build_object(
            'id', pv.id,
            'color', pv.color,
            'price', pv.price,
            'stock', pv.stock,
            'batteryCapacity', pv.battery_capacity,
            'motorPower', pv.motor_power,
            'speed', pv.speed,
            'rangePerCharge', pv.range_per_charge
          ))
          FROM product_variants pv
          WHERE pv.product_id = p.id
        ) as variants,
        (
          SELECT json_agg(json_build_object(
            'url', pi.image_url,
            'isPrimary', pi.is_primary
          ))
          FROM (
            SELECT * FROM product_images
            WHERE product_id = p.id
            ORDER BY is_primary DESC
            LIMIT 1
          ) AS pi
        ) AS images,
        (
          SELECT COALESCE(AVG(r.rating), 0)
          FROM reviews r
          WHERE r.product_id = p.id
        ) as rating,
        (
          SELECT COUNT(r.id)
          FROM reviews r
          WHERE r.product_id = p.id
        ) as reviewCount
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.is_active = true
    `;

    const params = [];
    let paramCount = 1;

    // Thêm điều kiện lọc
    if (category) {
      query += ` AND p.category_id = $${paramCount++}`;
      params.push(category);
    }

    if (brand_id) {
      query += ` AND p.brand_id = $${paramCount++}`;
      params.push(brand_id);
    }

    if (minPrice) {
      query += ` AND p.base_price >= $${paramCount++}`;
      params.push(minPrice);
    }

    if (maxPrice) {
      query += ` AND p.base_price <= $${paramCount++}`;
      params.push(maxPrice);
    }

    if (search) {
      query += ` AND p.name ILIKE $${paramCount++}`;
      params.push(`%${search}%`);
    }

    if (inStock === "true") {
      query += ` AND (p.stock > 0 OR EXISTS (
        SELECT 1 FROM product_variants pv 
        WHERE pv.product_id = p.id AND pv.stock > 0
      ))`;
    }

    // Thêm sắp xếp
    switch (sort) {
      case "price_asc":
        query += ` ORDER BY p.base_price ASC`;
        break;
      case "price_desc":
        query += ` ORDER BY p.base_price DESC`;
        break;
      case "popularity":
        query += ` ORDER BY (SELECT COUNT(*) FROM order_details od WHERE od.product_id = p.id) DESC`;
        break;
      default: // newest
        query += ` ORDER BY p.created_at DESC`;
    }

    // Thêm phân trang
    query += `
      LIMIT $${paramCount++}
      OFFSET $${paramCount}
    `;
    params.push(limit, offset);

    return { query, params };
  },

  // Lấy thông tin chi tiết sản phẩm
  getProductById: `
    SELECT 
  p.*,
  c.name as "categoryName",
  b.name as "brandName", b.logo_url as "brandLogo",
  (
    SELECT json_agg(json_build_object(
      'id', pv.id,
      'color', pv.color,
      'price', pv.price,
      'stock', pv.stock,
      'batteryCapacity', pv.battery_capacity,
      'motorPower', pv.motor_power,
      'speed', pv.speed,
      'rangePerCharge', pv.range_per_charge,
      'weight', pv.weight,
      'dimensions', pv.dimensions
    ))
    FROM product_variants pv
    WHERE pv.product_id = p.id
  ) as variants,
  (
    SELECT json_agg(json_build_object(
      'id', pi.id,
      'url', pi.image_url,
      'isPrimary', pi.is_primary,
      'altText', pi.alt_text
    ))
    FROM (
      SELECT id, image_url, is_primary, alt_text
      FROM product_images
      WHERE product_id = p.id
      ORDER BY is_primary DESC, display_order
    ) pi
  ) as images
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN brands b ON p.brand_id = b.id
WHERE p.id = $1 AND p.is_active = true
  `,

  // Tạo sản phẩm mới
  createProduct: `
    INSERT INTO products (
      name, slug, category_id, brand_id, description, 
      base_price, stock, is_active, is_featured
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `,

  // Cập nhật sản phẩm
  updateProduct: `
    UPDATE products
    SET 
      name = $1,
      slug = $2,
      category_id = $3,
      brand_id = $4,
      description = $5,
      base_price = $6,
      stock = $7,
      is_featured = $8,
      updated_at = NOW()
    WHERE id = $9
    RETURNING *
  `,

  // Xóa sản phẩm (soft delete)
  deleteProduct: `
    UPDATE products
    SET is_active = false, updated_at = NOW()
    WHERE id = $1
    RETURNING id
  `,

  // Tạo biến thể sản phẩm
  createProductVariant: `
    INSERT INTO product_variants (
      product_id, color, battery_capacity, motor_power, 
      speed, range_per_charge, price, stock, weight, dimensions
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `,

  // Thêm hình ảnh sản phẩm
  addProductImage: `
    INSERT INTO product_images (
      product_id, variant_id, image_url, is_primary, alt_text, display_order
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `,
};
