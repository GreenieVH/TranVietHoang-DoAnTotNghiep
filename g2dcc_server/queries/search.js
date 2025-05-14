const pool = require("../config/db");

const searchAll = async (searchTerm, filters = {}) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const formattedSearch = `%${searchTerm.toLowerCase()}%`;

    // Format search term - tách từ khóa thành các từ riêng lẻ
    const searchTerms = searchTerm
      .toLowerCase()
      .split(" ")
      .filter((term) => term.length > 0);
    const formattedSearchTerms = searchTerms.map((term) => `%${term}%`);
    const results = {};

    // --- PRODUCTS ---
    const productsQuery = `
    SELECT DISTINCT
      'product' as type,
      p.id,
      p.name as title,
      p.description,
      p.base_price as price,
      p.created_at,
      p.is_active,
      c.name as category_name,
      b.name as brand_name,
      ip.image_url as img,
      pv.color as variant_color,
      pv.stock,
      p.slug,
      p.is_featured,
      p.rating,
      pv.price as variant_price,
      pv.sku,
      pv.battery_capacity,
      pv.motor_power,
      pv.speed,
      pv.range_per_charge,
      pv.weight,
      pv.dimensions
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN product_images ip ON p.id = ip.product_id
    LEFT JOIN brands b ON p.brand_id = b.id
    LEFT JOIN product_variants pv ON p.id = pv.product_id AND pv.is_default = true
    WHERE 
      (
        LOWER(p.name) ILIKE $1 OR 
        LOWER(p.description) ILIKE $1 OR
        LOWER(c.name) ILIKE $1 OR
        LOWER(b.name) ILIKE $1
      )
      AND ($2::boolean IS NULL OR p.is_active = $2)
      AND ($3::uuid IS NULL OR p.category_id = $3)
      AND ($4::uuid IS NULL OR p.brand_id = $4)
  `;
    if (!filters.type || filters.type === "product") {
      const productsResult = await client.query(productsQuery, [
        formattedSearch,
        filters.productStatus,
        filters.categoryId,
        filters.brandId,
      ]);
      results.products = productsResult.rows;
    }

    // --- ORDERS ---
    if (!filters.type || filters.type === 'order') {
      const ordersQuery = `
        SELECT 
          'order' as type,
          o.id,
          o.created_at,
          o.total_amount,
          o.status,
          o.user_id,
          u.username as title
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        WHERE 
          (
            LOWER(u.username) ILIKE $1 OR
            LOWER(CAST(o.total_amount AS TEXT)) ILIKE $1 OR
            LOWER(CAST(o.status AS TEXT)) ILIKE $1
          )
          AND ($2::uuid IS NULL OR o.user_id = $2)
          AND ($3::text IS NULL OR o.status = $3)
      `;
      const ordersResult = await client.query(ordersQuery, [
        formattedSearch,
        filters.userId,
        filters.orderStatus
      ]);
      results.orders = ordersResult.rows;
    }
    // --- USERS ---
    if (!filters.type || filters.type === 'user') {
      const usersQuery = `
        SELECT 
          'user' as type,
          u.id,
          u.username as title,
          u.email,
          u.created_at,
          r.name as role_name
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE 
          (
            LOWER(u.username) ILIKE $1 OR
            LOWER(u.email) ILIKE $1
          )
          AND ($2::text IS NULL OR r.name = $2)
      `;
      const usersResult = await client.query(usersQuery, [
        formattedSearch,
        filters.userRole
      ]);
      results.users = usersResult.rows;
    }
    // --- CATEGORIES ---
    if (!filters.type || filters.type === 'category') {
      const categoriesQuery = `
        SELECT 
          'category' as type,
          id,
          name as title,
          description,
          created_at
        FROM categories
        WHERE 
          (
            LOWER(name) ILIKE $1 OR
            LOWER(description) ILIKE $1
          )
      `;
      const categoriesResult = await client.query(categoriesQuery, [formattedSearch]);
      results.categories = categoriesResult.rows;
    }
    // --- BRANDS ---
    if (!filters.type || filters.type === 'brand') {
      const brandsQuery = `
        SELECT 
          'brand' as type,
          id,
          name as title,
          description,
          created_at
        FROM brands
        WHERE 
          (
            LOWER(name) ILIKE $1 OR
            LOWER(description) ILIKE $1
          )
      `;
      const brandsResult = await client.query(brandsQuery, [formattedSearch]);
      results.brands = brandsResult.rows;
    }

    await client.query("COMMIT");
    return results;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  searchAll,
};
