const { searchAll } = require('../queries/search');

// Tìm kiếm cho user (không cần đăng nhập)
const userSearch = async (req, res) => {
  try {
    const { searchTerm, filters } = req.query;
    
    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập từ khóa tìm kiếm'
      });
    }

    // Chỉ tìm kiếm sản phẩm cho user
    const results = await searchAll(searchTerm, {
      ...filters,
      type: 'product'
    });

    // Lọc chỉ lấy sản phẩm active
    const filteredProducts = results.products?.filter(p => p.is_active === true) || [];

    return res.status(200).json({
      success: true,
      data: {
        results: {
          products: filteredProducts
        },
        total: {
          products: filteredProducts.length
        }
      }
    });

  } catch (error) {
    console.error('User search error:', error);
    return res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi tìm kiếm'
    });
  }
};

// Tìm kiếm cho admin/staff (cần đăng nhập)
const adminSearch = async (req, res) => {
  try {
    const { searchTerm, filters } = req.query;
    
    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập từ khóa tìm kiếm'
      });
    }

    const results = await searchAll(searchTerm, filters);

    // Tổng hợp kết quả
    const totalResults = {
      products: results.products?.length || 0,
      orders: results.orders?.length || 0,
      users: results.users?.length || 0,
      categories: results.categories?.length || 0,
      brands: results.brands?.length || 0
    };

    // Phân quyền kết quả
    const userRole = req.user?.role;
    const filteredResults = {};

    // Admin có thể xem tất cả
    if (userRole === 'admin') {
      filteredResults.products = results.products;
      filteredResults.orders = results.orders;
      filteredResults.users = results.users;
      filteredResults.categories = results.categories;
      filteredResults.brands = results.brands;
    } 
    // Staff chỉ xem được sản phẩm, đơn hàng, danh mục và thương hiệu
    else if (userRole === 'staff') {
      filteredResults.products = results.products;
      filteredResults.orders = results.orders;
      filteredResults.categories = results.categories;
      filteredResults.brands = results.brands;
    }

    return res.status(200).json({
      success: true,
      data: {
        results: filteredResults,
        total: totalResults
      }
    });

  } catch (error) {
    console.error('Admin search error:', error);
    return res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi tìm kiếm'
    });
  }
};

module.exports = {
  userSearch,
  adminSearch
}; 