const db = require('../config/db');
const supplierQueries = require('../queries/suppliers');

module.exports = {
  getAllSuppliers: async (req, res) => {
    try {
      const result = await db.query(supplierQueries.getAllSuppliers);
      res.json({ success: true, data: result.rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  getSupplierById: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await db.query(supplierQueries.getSupplierById, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Supplier not found' });
      }

      res.json({ success: true, data: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  createSupplier: async (req, res) => {
    try {
      const {
        name, address, email, phone, taxCode, contactPerson
      } = req.body;

      const result = await db.query(supplierQueries.createSupplier, [
        name, address, email, phone || null, taxCode || null, 
        contactPerson || null, true
      ]);

      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  updateSupplier: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        name, address, email, phone, taxCode, contactPerson, isActive
      } = req.body;

      const result = await db.query(supplierQueries.updateSupplier, [
        name, address, email, phone || null, taxCode || null, 
        contactPerson || null, isActive !== false, id
      ]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Supplier not found' });
      }

      res.json({ success: true, data: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  deleteSupplier: async (req, res) => {
    try {
      const { id } = req.params;

      // Check if supplier has import records
      const importsCheck = await db.query(
        'SELECT 1 FROM import_products WHERE supplier_id = $1 LIMIT 1',
        [id]
      );

      if (importsCheck.rows.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Cannot delete supplier with import records' 
        });
      }

      const result = await db.query(supplierQueries.deleteSupplier, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Supplier not found' });
      }

      res.json({ success: true, message: 'Supplier deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
};