import APIAUTH from '@/config/apiAuth';

export const getWishlist = async (page = 1, limit = 10) => {
  try {
    const response = await APIAUTH.get('/wishlist', {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    throw error;
  }
};

export const addToWishlist = async (productId) => {
  try {
    const response = await APIAUTH.post('/wishlist', { productId });
    return response.data;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
};

export const removeFromWishlist = async (productId) => {
  try {
    const response = await APIAUTH.delete(`/wishlist/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw error;
  }
};

export const checkInWishlist = async (productId) => {
  try {
    const response = await APIAUTH.get(`/wishlist/check/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error checking wishlist:', error);
    throw error;
  }
};