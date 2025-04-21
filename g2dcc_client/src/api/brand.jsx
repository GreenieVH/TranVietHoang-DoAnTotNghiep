import API from "@/config/api";
import APIAUTH from "@/config/apiAuth";

export const getBrands = async () => {
  try {
    const response = await API.get(`/brands`);
    return response.data;
  } catch (error) {
    console.error("Error fetching brands:", error);
    throw error;
  }
};

export const getBrandById = async (id) => {
  try {
    const response = await API.get(`/brands/${id}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching brand:", error);
    throw error;
  }
};

export const getBrandProducts = async (id, page = 1, limit = 12) => {
  try {
    const response = await API.get(`/brands/${id}/products`, {
      params: { page, limit },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching brand products:", error);
    throw error;
  }
};

export const createBrand = async (data) => {
  try {
    const response = await APIAUTH.post(`/brands`, data);
    return response.data.data;
  } catch (error) {
    console.error("Error creating brand:", error);
    throw error;
  }
};

export const updateBrand = async (id, data) => {
  try {
    const response = await APIAUTH.put(`/brands/${id}`, data);
    return response.data.data;
  } catch (error) {
    console.error("Error updating brand:", error);
    throw error;
  }
};

export const deleteBrand = async (id) => {
  try {
    const response = await APIAUTH.delete(`/brands/${id}`);
    return response.data.data;
  } catch (error) {
    console.error("Error deleting brand:", error);
    throw error;
  }
};
