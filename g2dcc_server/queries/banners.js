module.exports = {
    getAllBanners: `
      SELECT * FROM banners
      WHERE is_active = true
      ORDER BY display_order, created_at DESC
    `,
  
    getBannerById: `
      SELECT * FROM banners
      WHERE id = $1
    `,
  
    createBanner: `
      INSERT INTO banners (
        title, image_url, redirect_url, display_order, 
        is_active, start_date, end_date, banner_type
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `,
  
    updateBanner: `
      UPDATE banners
      SET 
        title = $1,
        image_url = $2,
        redirect_url = $3,
        display_order = $4,
        is_active = $5,
        start_date = $6,
        end_date = $7,
        banner_type = $8
      WHERE id = $9
      RETURNING *
    `,
  
    deleteBanner: `
      DELETE FROM banners
      WHERE id = $1
      RETURNING id
    `
}