const db = require('../config/db');
const bannerQueries = require('../queries/banners');

module.exports = {
  getAllBanners: async (req, res) => {
    try {
      const { type } = req.query;
      let query = bannerQueries.getAllBanners;
      const params = [];

      if (type) {
        query = query.replace('WHERE', 'WHERE banner_type = $1 AND');
        params.push(type);
      }

      const result = await db.query(query, params);
      res.json({ success: true, data: result.rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  getBannerById: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await db.query(bannerQueries.getBannerById, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Banner not found' });
      }

      res.json({ success: true, data: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  createBanner: async (req, res) => {
    try {
      const {
        title, imageUrl, redirectUrl, displayOrder,
        isActive, startDate, endDate, bannerType
      } = req.body;

      const result = await db.query(bannerQueries.createBanner, [
        title, imageUrl, redirectUrl || null, displayOrder || 0,
        isActive !== false, startDate || new Date(), endDate || null,
        bannerType || 'main'
      ]);

      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  updateBanner: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        title, imageUrl, redirectUrl, displayOrder,
        isActive, startDate, endDate, bannerType
      } = req.body;

      const result = await db.query(bannerQueries.updateBanner, [
        title, imageUrl, redirectUrl || null, displayOrder || 0,
        isActive !== false, startDate || new Date(), endDate || null,
        bannerType || 'main', id
      ]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Banner not found' });
      }

      res.json({ success: true, data: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  deleteBanner: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await db.query(bannerQueries.deleteBanner, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Banner not found' });
      }

      res.json({ success: true, message: 'Banner deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
};