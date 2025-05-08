const db = require('../config/db');
const bannerQueries = require('../queries/banners');
const { uploadToCloudinary } = require('../utils/cloudinary');

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
      res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
  },

  getBannerById: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await db.query(bannerQueries.getBannerById, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy banner' });
      }

      res.json({ success: true, data: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
  },

  createBanner: async (req, res) => {
    try {
      const {
        title, redirectUrl, displayOrder,
        isActive, startDate, endDate, bannerType
      } = req.body;

      // Xử lý upload ảnh nếu có
      let imageUrl = null;
      if (req.file) {
        imageUrl = await uploadToCloudinary(
          req.file.buffer,
          "banner_images"
        );
      }

      if (!imageUrl) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng tải lên hình ảnh banner"
        });
      }

      const result = await db.query(bannerQueries.createBanner, [
        title,
        imageUrl,
        redirectUrl || null,
        displayOrder || 0,
        isActive !== false,
        startDate || new Date(),
        endDate || null,
        bannerType || 'main'
      ]);

      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
      console.error("Lỗi khi tạo banner:", err);
      res.status(500).json({
        success: false,
        message: "Lỗi máy chủ",
        error: process.env.NODE_ENV === "development" ? err.message : undefined
      });
    }
  },

  updateBanner: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        title, redirectUrl, displayOrder,
        isActive, startDate, endDate, bannerType
      } = req.body;

      // Xử lý ảnh nếu có
      let imageUrl = null;
      if (req.file) {
        imageUrl = await uploadToCloudinary(
          req.file.buffer,
          "banner_images"
        );
      }

      // Nếu không có ảnh mới, lấy ảnh cũ
      if (!imageUrl) {
        const currentBanner = await db.query(bannerQueries.getBannerById, [id]);
        if (currentBanner.rows.length === 0) {
          return res.status(404).json({ success: false, message: 'Không tìm thấy banner' });
        }
        imageUrl = currentBanner.rows[0].image_url;
      }

      const result = await db.query(bannerQueries.updateBanner, [
        title,
        imageUrl,
        redirectUrl || null,
        displayOrder || 0,
        isActive !== false,
        startDate || new Date(),
        endDate || null,
        bannerType || 'main',
        id
      ]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy banner' });
      }

      res.json({ success: true, data: result.rows[0] });
    } catch (err) {
      console.error("Lỗi khi cập nhật banner:", err);
      res.status(500).json({
        success: false,
        message: "Lỗi máy chủ",
        error: process.env.NODE_ENV === "development" ? err.message : undefined
      });
    }
  },

  deleteBanner: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await db.query(bannerQueries.deleteBanner, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy banner' });
      }

      res.json({ success: true, message: 'Xóa banner thành công' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
  }
};