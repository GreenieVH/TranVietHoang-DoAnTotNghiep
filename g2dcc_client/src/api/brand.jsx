import axios from 'axios';
const baseURL = import.meta.env.VITE_BASE_URL;

const API = axios.create({
    baseURL: baseURL, 
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });

export const getBrands = async () => {
  try {
    const response = await API.get(`/brands`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching brands:', error);
    throw error;
  }
};

export const getBrandById = async (id) => {
  try {
    const response = await API.get(`/brands/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching brand:', error);
    throw error;
  }
};

export const getBrandProducts = async (id, page = 1, limit = 12) => {
  try {
    const response = await API.get(`/brands/${id}/products`, {
      params: { page, limit }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching brand products:', error);
    throw error;
  }
};