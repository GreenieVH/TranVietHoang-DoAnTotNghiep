import API from '@/config/api';

export const getProducts = async (params = {}) => {
  try {
    const response = await API.get(`/products`, { params });

    return {
      products: response.data.data.products,
      pagination: response.data.data.pagination,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

export const createProduct = async (data) => {
  try {
    const response = await API.post("/products", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

export const updateProduct = async (id, data) => {
  try {
    const response = await API.put(`/products/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    const response = await API.delete(`/products/${id}`);
    return response.data.data;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

export const getProductById = async (id) => {
  try {
    const response = await API.get(`/products/${id}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
};

export const getVariantById = async (productId) => {
  try {
    const response = await API.get(`/variants/${productId}/var`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching variants:", error);
    throw error;
  }
};

export const createVariant = async (productId, data) => {
  try {
    const response = await API.post(`/products/${productId}/variants`, data);
    return response.data.data;
  } catch (error) {
    console.error("Error creating variant:", error);
    throw error;
  }
};

export const deleteVariant = async (variantId) => {
  try {
    const response = await API.delete(`/variants/${variantId}`);
    return response.data.data;
  } catch (error) {
    console.error("Error deleting variant:", error);
    throw error;
  }
};

export const updateVariant = async (variantId, data) => {
  try {
    const response = await API.put(`/variants/${variantId}`, data);
    return response.data.data;
  } catch (error) {
    console.error("Error updating variant:", error);
    throw error;
  }
};

export const getProductReviews = async (productId, params = {}) => {
  try {
    const response = await API.get(`/reviews/product/${productId}`, { params });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    throw error;
  }
};

// Thêm các hàm API khác cho sản phẩm khi cần
