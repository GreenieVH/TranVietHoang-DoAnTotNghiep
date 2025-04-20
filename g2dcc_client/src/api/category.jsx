import API from '@/config/api';

export const getCategories = async () => {
  try {
    const response = await API.get(`/categories`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export const createCategory = async (data) => {
  try {
    const response = await API.post(`/categories`, data);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export const updateCategory = async (id, data) => {
  try {
    const response = await API.put(`/categories/${id}`, data);
    return response.data.data;
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
};

export const deleteCategory = async (id) => {
  try {
    const response = await API.delete(`/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};

export const getCategoryById = async (id) => {
  try {
    const response = await API.get(`/categories/${id}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching category:", error);
    throw error;
  }
};
