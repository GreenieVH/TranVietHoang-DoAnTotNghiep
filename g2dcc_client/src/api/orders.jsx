import API from '@/config/api';
import APIAUTH from '@/config/apiAuth';

export const createOrder = async (orderData) => {
  try {
    const response = await APIAUTH.post('/orders', orderData);
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};
// Add item to order
export const addOrderItem = async (itemData) => {
  try {
    const response = await APIAUTH.post(`/orders/items`, itemData);
    return response.data;
  } catch (error) {
    console.error('Error adding order item:', error);
    throw error;
  }
};

export const getUserOrders = async (page = 1, limit = 10) => {
  try {
    const response = await APIAUTH.get('/orders/my-orders', {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
};

export const getOrderById = async (orderId) => {
  try {
    const response = await APIAUTH.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await APIAUTH.put(`/orders/${orderId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

export const updateShipment = async (orderId, shipmentData) => {
  try {
    const response = await APIAUTH.put(`/orders/${orderId}/shipment`, shipmentData);
    return response.data;
  } catch (error) {
    console.error('Error updating shipment:', error);
    throw error;
  }
};

export const getOrders = async (page = 1, limit = 10, filters = {}) => {
  try {
    const response = await APIAUTH.get('/orders', {
      params: { page, limit, ...filters }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

export const confirmOrderDelivery = async (orderId, status) => {
  try {
    const response = await APIAUTH.post(`/orders/${orderId}/confirm-delivery`, { status });
    return response.data;
  } catch (error) {
    console.error('Error confirming order delivery:', error);
    throw error;
  }
};

// Get all order logs
export const getAllOrderLogs = async () => {
  try {
    const response = await APIAUTH.get('/orders/logs');
    return response.data;
  } catch (error) {
    console.error('Error fetching all order logs:', error);
    throw error;
  }
};

// Get logs for a specific order
export const getOrderLogs = async (orderId) => {
  try {
    const response = await APIAUTH.get(`/orders/${orderId}/logs`);
    return response.data;
  } catch (error) {
    console.error('Error fetching order logs:', error);
    throw error;
  }
};