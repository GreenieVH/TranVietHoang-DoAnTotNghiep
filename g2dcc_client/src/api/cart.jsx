import APIAUTH from "@/config/apiAuth";

export const getCart = async () => {
  try {
    const response = await APIAUTH.get("/cart");
    return response.data;
  } catch (error) {
    console.error("Error fetching cart:", error);
    throw error;
  }
};

export const addToCart = async (productId, variantId, quantity = 1) => {
  try {
    const response = await APIAUTH.post("/cart/items", {
      productId,
      variantId,
      quantity,
    });
    return response.data;
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error;
  }
};

export const updateCartItem = async (itemId, quantity) => {
  try {
    const response = await APIAUTH.put(`/cart/items/${itemId}`, { quantity });
    return response.data;
  } catch (error) {
    console.error("Error updating cart item:", error);
    throw error;
  }
};

export const removeCartItem = async (itemId) => {
  try {
    const response = await APIAUTH.delete(`/cart/items/${itemId}`);
    return response.data;
  } catch (error) {
    console.error("Error removing cart item:", error);
    throw error;
  }
};

export const clearCart = async () => {
  try {
    const response = await APIAUTH.delete("/cart/clear");
    return response.data;
  } catch (error) {
    console.error("Error clearing cart:", error);
    throw error;
  }
};
