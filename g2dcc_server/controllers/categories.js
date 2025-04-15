const db = require('../config/db');
const categoryQueries = require('../queries/categories');
const slugify = require('slugify');

module.exports = {
  getAllCategories: async (req, res) => {
    try {
      const result = await db.query(categoryQueries.getAllCategories);
      res.json({ success: true, data: result.rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  getCategoryById: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await db.query(categoryQueries.getCategoryById, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }

      res.json({ success: true, data: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  createCategory: async (req, res) => {
    try {
      const { name, description, parentId } = req.body;
      const slug = slugify(name, { lower: true, strict: true });

      const result = await db.query(categoryQueries.createCategory, [
        name, description, parentId || null, true, slug
      ]);

      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  updateCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, parentId } = req.body;
      const slug = slugify(name, { lower: true, strict: true });

      const result = await db.query(categoryQueries.updateCategory, [
        name, description, parentId || null, slug, id
      ]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }

      res.json({ success: true, data: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  deleteCategory: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if category has products
      const productsCheck = await db.query(
        'SELECT 1 FROM products WHERE category_id = $1 AND is_active = true LIMIT 1',
        [id]
      );

      if (productsCheck.rows.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Cannot delete category with active products' 
        });
      }

      const result = await db.query(categoryQueries.deleteCategory, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }

      res.json({ success: true, message: 'Category deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
};