import API from "@/config/api";
import APIAUTH from '../config/apiAuth';

export const getAllBanners = async () => {
  try {
    const response = await API.get('/banners');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getBannerById = async (id) => {
  try {
    const response = await API.get(`/banners/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createBanner = async (formData) => {
  try {
    // Kiểm tra xem có file ảnh không
    if (!formData.get('bannerImage')) {
      throw new Error('Vui lòng tải lên hình ảnh banner');
    }

    const response = await APIAUTH.post('/banners', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateBanner = async (id, formData) => {
  try {
    const response = await APIAUTH.put(`/banners/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteBanner = async (id) => {
  try {
    const response = await APIAUTH.delete(`/banners/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}; 