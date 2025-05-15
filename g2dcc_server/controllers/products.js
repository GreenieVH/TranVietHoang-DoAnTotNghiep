const db = require("../config/db");
const productQueries = require("../queries/products");
const inventoryQueries = require("../queries/inventory");
const { v4: uuidv4 } = require("uuid");
const slugify = require("slugify");
const { uploadToCloudinary, cloudinary } = require("../utils/cloudinary");

module.exports = {
  // Lấy danh sách sản phẩm
  getProducts: async (req, res) => {
    try {
      const filters = req.query;
      const { query, params } = productQueries.getProducts(filters);

      const result = await db.query(query, params);

      // Lấy tổng số sản phẩm (không phân trang)
      let countQuery = "SELECT COUNT(*) FROM products WHERE is_active = true";
      const countParams = [];
      let paramCount = 1;

      if (filters.category) {
        countQuery += ` AND category_id = $${paramCount++}`;
        countParams.push(filters.category);
      }

      if (filters.brand_id) {
        countQuery += ` AND brand_id = $${paramCount++}`;
        countParams.push(filters.brand_id);
      }

      const countResult = await db.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].count, 10);

      res.json({
        success: true,
        data: {
          products: result.rows,
          pagination: {
            total,
            page: parseInt(filters.page || 1, 10),
            pages: Math.ceil(total / parseInt(filters.limit || 10, 10)),
            limit: parseInt(filters.limit || 10, 10),
          },
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // Lấy chi tiết sản phẩm
  getProductById: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await db.query(productQueries.getProductById, [id]);

      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }

      res.json({ success: true, data: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // Tạo sản phẩm mới
  createProduct: async (req, res) => {
    try {
      const {
        name = "",
        categoryId,
        brandId,
        description = "",
        basePrice,
        stock,
        isFeatured,
      } = req.body;

      // Kiểm tra tên hợp lệ
      if (!name || typeof name !== "string") {
        return res.status(400).json({
          success: false,
          message: "Product name is required and must be a string",
        });
      }
      // Kiểm tra brand hợp lệ
      const brandCheck = await db.query(
        "SELECT 1 FROM brands WHERE id = $1 AND is_active = true",
        [brandId]
      );

      if (brandCheck.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid brand ID",
        });
      }

      // Kiểm tra category hợp lệ
      const categoryCheck = await db.query(
        "SELECT id FROM categories WHERE id = $1",
        [categoryId]
      );

      if (categoryCheck.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID",
          details: `Category with ID ${categoryId} not found`,
        });
      }
      // Kiểm tra tên sản phẩm trùng (chỉ với sản phẩm active)
      const nameCheck = await db.query(
        "SELECT id FROM products WHERE name = $1 AND is_active = true",
        [name]
      );
      if (nameCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Product with this name already exists",
        });
      }

      // Tạo slug và kiểm tra trùng
      let slug = name
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");
      let slugExists = true;
      let counter = 1;
      let originalSlug = slug;

      while (slugExists) {
        const slugCheck = await db.query(
          "SELECT 1 FROM products WHERE slug = $1",
          [slug]
        );
        if (slugCheck.rows.length === 0) {
          slugExists = false;
        } else {
          slug = `${originalSlug}-${counter++}`;
        }
      }

      const result = await db.query(productQueries.createProduct, [
        name,
        slug,
        categoryId,
        brandId,
        description,
        basePrice,
        stock,
        true,
        isFeatured || false,
      ]);

      // Xử lý upload ảnh sau khi tạo sản phẩm thành công
      if (req.file) {
        const imgUrl = await uploadToCloudinary(
          req.file.buffer,
          "product_images"
        );

        await db.query(productQueries.addProductImage, [
          result.rows[0].id, // product_id
          null, // variant_id (null nếu là ảnh chính của sản phẩm)
          imgUrl,
          true, // is_primary
          `Ảnh chính của ${name}`,
          1, // display_order
        ]);
      }

      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
      console.error("Error creating product:", {
        message: err.message,
        stack: err.stack,
        code: err.code,
        detail: err.detail,
        hint: err.hint,
      });
      res.status(500).json({
        success: false,
        message: "Server error",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  },

  // Cập nhật sản phẩm
  updateProduct: async (req, res) => {
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      
      const { id } = req.params;
      const {
        name = "",
        categoryId,
        brandId,
        description = "",
        basePrice,
        stock,
        isFeatured,
      } = req.body;

      // Validate name
      if (!name || typeof name !== "string") {
        return res.status(400).json({
          success: false,
          message: "Product name is required and must be a string",
        });
      }

      // Validate brand_id
      if (brandId) {
        const brandCheck = await client.query(
          "SELECT 1 FROM brands WHERE id = $1 AND is_active = true",
          [brandId]
        );

        if (brandCheck.rows.length === 0) {
          return res.status(400).json({
            success: false,
            message: "Invalid brand ID",
          });
        }
      }

      // Lấy số lượng tồn kho hiện tại
      const currentStock = await client.query(
        "SELECT stock FROM products WHERE id = $1",
        [id]
      );

      if (currentStock.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      const oldStock = currentStock.rows[0].stock;
      const stockChange = stock - oldStock;

      // Tạo slug từ tên sản phẩm
      const slug = name
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");

      // Cập nhật sản phẩm
      const result = await client.query(productQueries.updateProduct, [
        name,
        slug,
        categoryId,
        brandId,
        description,
        basePrice,
        stock,
        isFeatured || false,
        id,
      ]);

      // Tạo log thay đổi tồn kho nếu có thay đổi
      if (stockChange !== 0) {
        await client.query(inventoryQueries.createInventoryLog, [
          id,
          null, // variant_id
          stockChange,
          stock,
          'ADJUSTMENT',
          id,
          `Điều chỉnh tồn kho sản phẩm ${name}`,
          req.user?.id
        ]);
      }

      // Xử lý ảnh nếu có
      if (req.file) {
        // Xóa ảnh cũ (nếu cần)
        await client.query(
          `DELETE FROM product_images 
         WHERE product_id = $1 AND is_primary = true`,
          [id]
        );

        // Upload và thêm ảnh mới
        const imgUrl = await uploadToCloudinary(
          req.file.buffer,
          "product_images"
        );

        await client.query(productQueries.addProductImage, [
          id,
          null,
          imgUrl,
          true,
          `Ảnh chính của ${name}`,
          1,
        ]);
      }

      await client.query('COMMIT');
      res.json({ success: true, data: result.rows[0] });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    } finally {
      client.release();
    }
  },

  // Xóa sản phẩm
  deleteProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await db.query(productQueries.deleteProduct, [id]);

      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }

      res.json({ success: true, message: "Product deleted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // Tạo biến thể sản phẩm
  createVariant: async (req, res) => {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      const { productId } = req.params;
      const {
        color,
        batteryCapacity,
        motorPower,
        speed,
        rangePerCharge,
        price,
        stock,
        weight,
        dimensions,
      } = req.body;

      const result = await client.query(productQueries.createProductVariant, [
        productId,
        color,
        batteryCapacity,
        motorPower,
        speed,
        rangePerCharge,
        price,
        stock,
        weight,
        dimensions,
      ]);

      // Tạo log thay đổi tồn kho cho biến thể mới
      await client.query(inventoryQueries.createInventoryLog, [
        productId,
        result.rows[0].id,
        stock,
        stock,
        'IMPORT',
        null,
        `Tạo biến thể mới: ${color}`,
        req.user.id
      ]);

      await client.query('COMMIT');
      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    } finally {
      client.release();
    }
  },

  // Thêm hình ảnh sản phẩm
  addImage: async (req, res) => {
    try {
      const { productId } = req.params;
      const { variantId, imageUrl, isPrimary, altText, displayOrder } =
        req.body;

      // Nếu đánh dấu là ảnh chính, hủy tất cả ảnh chính khác
      if (isPrimary) {
        await db.query(
          "UPDATE product_images SET is_primary = false WHERE product_id = $1",
          [productId]
        );
      }

      const result = await db.query(productQueries.addProductImage, [
        productId,
        variantId || null,
        imageUrl,
        isPrimary || false,
        altText || "",
        displayOrder || 0,
      ]);

      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // Lấy lịch sử tồn kho
  getInventoryHistory: async (req, res) => {
    try {
      const { productId, variantId } = req.params;
      let result;

      if (variantId) {
        result = await db.query(inventoryQueries.getVariantInventoryHistory, [variantId]);
      } else {
        result = await db.query(inventoryQueries.getProductInventoryHistory, [productId]);
      }

      // Thêm thông tin người dùng hiện tại nếu chưa có
      const logs = result.rows.map(log => ({
        ...log,
        created_by: log.created_by || req.user?.id,
        created_by_name: log.created_by_name || req.user?.username
      }));

      res.json({ success: true, data: logs });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // Lấy tất cả lịch sử tồn kho
  getAllInventoryHistory: async (req, res) => {
    try {
      const result = await db.query(inventoryQueries.getAllInventoryHistory);
      
      // Thêm thông tin người dùng hiện tại nếu chưa có
      const logs = result.rows.map(log => ({
        ...log,
        created_by: log.created_by || req.user?.id,
        created_by_name: log.created_by_name || req.user?.username
      }));

      res.json({ success: true, data: logs });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },
};
