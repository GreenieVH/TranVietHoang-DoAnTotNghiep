const db = require('../config/db');
const brandQueries = require('../queries/brands');
const { v4: uuidv4 } = require('uuid');
const slugify = require('slugify');

module.exports = {
  getAllBrands: async (req, res) => {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const offset = (page - 1) * limit;

      // Get paginated brands
      const brandsResult = await db.query(brandQueries.getAllBrands, [limit, offset]);
      
      // Get total count
      const countResult = await db.query(brandQueries.countAllBrands);
      const total = parseInt(countResult.rows[0].count, 10);

      res.json({
        success: true,
        data: brandsResult.rows,
        pagination: {
          total,
          page: parseInt(page, 10),
          pages: Math.ceil(total / limit),
          limit: parseInt(limit, 10)
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  getBrandById: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await db.query(brandQueries.getBrandById, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Brand not found' });
      }

      res.json({ success: true, data: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  createBrand: async (req, res) => {
    try {
      const { name, description, logoUrl, websiteUrl } = req.body;
      const slug = slugify(name, { lower: true, strict: true });
      const id = uuidv4();

      const result = await db.query(brandQueries.createBrand, [
        id, 
        name, 
        slug, 
        description || null, 
        logoUrl || null, 
        websiteUrl || null
      ]);

      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
      console.error(err);
      if (err.code === '23505') {
        return res.status(400).json({ 
          success: false, 
          message: 'Brand with this name already exists' 
        });
      }
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  updateBrand: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, logoUrl, websiteUrl, isActive } = req.body;

      const result = await db.query(brandQueries.updateBrand, [
        name, 
        description || null, 
        logoUrl || null, 
        websiteUrl || null, 
        isActive !== false, 
        id
      ]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Brand not found' });
      }

      res.json({ success: true, data: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  deleteBrand: async (req, res) => {
    try {
      const { id } = req.params;

      // Check if brand has products
      const productsCheck = await db.query(
        brandQueries.checkBrandHasProducts, 
        [id]
      );

      if (productsCheck.rows.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Cannot delete brand with existing products' 
        });
      }

      const result = await db.query(brandQueries.deleteBrand, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Brand not found' });
      }

      res.json({ success: true, message: 'Brand deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  getBrandProducts: async (req, res) => {
    try {
      const { id } = req.params;
      const { page = 1, limit = 12 } = req.query;
      const offset = (page - 1) * limit;

      // Check if brand exists
      const brandCheck = await db.query(
        brandQueries.checkBrandExists,
        [id]
      );

      if (brandCheck.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Brand not found' });
      }

      // Get products
      const productsResult = await db.query(
        brandQueries.getBrandProducts, 
        [id, limit, offset]
      );

      // Get total count
      const countResult = await db.query(
        brandQueries.countBrandProducts,
        [id]
      );

      res.json({
        success: true,
        data: {
          products: productsResult.rows,
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
  }
};