const db = require('../config/db');

const getAllProductVariants = async (productId) => {
  const query = `
    SELECT * FROM public.product_variants 
    WHERE product_id = $1
    ORDER BY created_at DESC
  `;
  const { rows } = await db.query(query, [productId]);
  return rows;
};

const getProductVariantById = async (id) => {
  const query = 'SELECT * FROM public.product_variants WHERE id = $1';
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

const createProductVariant = async (variantData) => {
  const {
    product_id,
    sku,
    color,
    battery_capacity,
    motor_power,
    speed,
    range_per_charge,
    price,
    stock,
    weight,
    dimensions,
    is_default
  } = variantData;

  const query = `
    INSERT INTO public.product_variants (
      product_id, sku, color, battery_capacity, motor_power, 
      speed, range_per_charge, price, stock, weight, 
      dimensions, is_default
    ) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *
  `;

  const values = [
    product_id,
    sku,
    color,
    battery_capacity,
    motor_power,
    speed,
    range_per_charge,
    price,
    stock,
    weight,
    dimensions,
    is_default
  ];

  const { rows } = await db.query(query, values);
  return rows[0];
};

const updateProductVariant = async (id, variantData) => {
  const {
    sku,
    color,
    battery_capacity,
    motor_power,
    speed,
    range_per_charge,
    price,
    stock,
    weight,
    dimensions,
    is_default
  } = variantData;

  const query = `
    UPDATE public.product_variants 
    SET 
      sku = $1,
      color = $2,
      battery_capacity = $3,
      motor_power = $4,
      speed = $5,
      range_per_charge = $6,
      price = $7,
      stock = $8,
      weight = $9,
      dimensions = $10,
      is_default = $11
    WHERE id = $12
    RETURNING *
  `;

  const values = [
    sku,
    color,
    battery_capacity,
    motor_power,
    speed,
    range_per_charge,
    price,
    stock,
    weight,
    dimensions,
    is_default,
    id
  ];

  const { rows } = await db.query(query, values);
  return rows[0];
};

const deleteProductVariant = async (id) => {
  const query = 'DELETE FROM public.product_variants WHERE id = $1 RETURNING *';
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

const setDefaultVariant = async (productId, variantId) => {
  // First reset all variants of this product to is_default = false
  await db.query(
    'UPDATE public.product_variants SET is_default = false WHERE product_id = $1',
    [productId]
  );
  
  // Then set the selected variant as default
  const query = `
    UPDATE public.product_variants 
    SET is_default = true 
    WHERE id = $1 AND product_id = $2
    RETURNING *
  `;
  const { rows } = await db.query(query, [variantId, productId]);
  return rows[0];
};

module.exports = {
  getAllProductVariants,
  getProductVariantById,
  createProductVariant,
  updateProductVariant,
  deleteProductVariant,
  setDefaultVariant
};