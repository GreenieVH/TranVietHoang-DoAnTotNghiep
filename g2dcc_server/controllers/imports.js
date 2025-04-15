const db = require('../config/db');
const importQueries = require('../queries/imports');

module.exports = {
  getAllImports: async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const result = await db.query(importQueries.getAllImports, [limit, offset]);

      // Get total count
      const countResult = await db.query('SELECT COUNT(*) FROM import_products');

      res.json({
        success: true,
        data: {
          imports: result.rows,
          pagination: {
            total: parseInt(countResult.rows[0].count, 10),
            page: parseInt(page, 10),
            pages: Math.ceil(countResult.rows[0].count / limit),
            limit: parseInt(limit, 10)
          }
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  getImportById: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await db.query(importQueries.getImportById, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Import record not found' });
      }

      res.json({ success: true, data: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  createImport: async (req, res) => {
    try {
      const { userId } = req;
      const {
        productId, variantId, quantity, unitPrice, 
        supplierId, note, importDate
      } = req.body;

      // Validate product
      const product = await db.query(
        'SELECT 1 FROM products WHERE id = $1 AND is_active = true',
        [productId]
      );

      if (product.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Product not found or inactive' 
        });
      }

      // Validate variant if provided
      if (variantId) {
        const variant = await db.query(
          'SELECT 1 FROM product_variants WHERE id = $1',
          [variantId]
        );

        if (variant.rows.length === 0) {
          return res.status(404).json({ 
            success: false, 
            message: 'Variant not found' 
          });
        }
      }

      // Validate supplier
      const supplier = await db.query(
        'SELECT 1 FROM suppliers WHERE id = $1 AND is_active = true',
        [supplierId]
      );

      if (supplier.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Supplier not found or inactive' 
        });
      }

      // Create import record
      const result = await db.query(importQueries.createImport, [
        productId, variantId || null, quantity, unitPrice, 
        supplierId, userId, note || null, importDate || new Date()
      ]);

      // Update stock
      if (variantId) {
        await db.query(importQueries.updateStock, [quantity, variantId]);
      } else {
        await db.query(
          'UPDATE products SET stock = stock + $1 WHERE id = $2',
          [quantity, productId]
        );
      }

      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
};