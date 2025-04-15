const db = require('../config/db');
const addressQueries = require('../queries/addresses');

module.exports = {
  getUserAddresses: async (req, res) => {
    try {
      const { userId } = req;
      const result = await db.query(addressQueries.getUserAddresses, [userId]);

      res.json({ success: true, data: result.rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  getAddressById: async (req, res) => {
    try {
      const { userId } = req;
      const { id } = req.params;

      const result = await db.query(addressQueries.getAddressById, [id, userId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Address not found' });
      }

      res.json({ success: true, data: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  createAddress: async (req, res) => {
    try {
      const { userId } = req;
      const {
        recipientName, phoneNumber, addressLine1,
        addressLine2, city, state, postalCode, country, isDefault
      } = req.body;

      // Clear existing default addresses if setting new default
      if (isDefault) {
        await db.query(addressQueries.clearDefaultAddresses, [userId]);
      }

      const result = await db.query(addressQueries.createAddress, [
        userId, recipientName, phoneNumber, addressLine1,
        addressLine2 || null, city, state, postalCode, country || 'Vietnam',
        isDefault || false
      ]);

      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  updateAddress: async (req, res) => {
    try {
      const { userId } = req;
      const { id } = req.params;
      const {
        recipientName, phoneNumber, addressLine1,
        addressLine2, city, state, postalCode, country, isDefault
      } = req.body;

      // Clear existing default addresses if setting new default
      if (isDefault) {
        await db.query(addressQueries.clearDefaultAddresses, [userId]);
      }

      const result = await db.query(addressQueries.updateAddress, [
        recipientName, phoneNumber, addressLine1,
        addressLine2 || null, city, state, postalCode, country || 'Vietnam',
        isDefault || false, id, userId
      ]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Address not found' });
      }

      res.json({ success: true, data: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  deleteAddress: async (req, res) => {
    try {
      const { userId } = req;
      const { id } = req.params;

      const result = await db.query(addressQueries.deleteAddress, [id, userId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Address not found' });
      }

      res.json({ success: true, message: 'Address deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
};