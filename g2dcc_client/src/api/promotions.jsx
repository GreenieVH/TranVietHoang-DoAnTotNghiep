import API from '@/config/api';
import APIAUTH from '@/config/apiAuth';

export const getAllPromotions = async () => {
    try {
        const response = await API.get('/promotions');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getPromotionById = async (id) => {
    try {
        const response = await API.get(`/promotions/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const validatePromotionCode = async (code, totalAmount) => {
    try {
        const response = await API.get(`/promotions/validate/${code}`, {
            params: { totalAmount },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createPromotion = async (data) => {
    try {
        const response = await APIAUTH.post('/promotions', data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updatePromotion = async (id, data) => {
    try {
        const response = await APIAUTH.put(`/promotions/${id}`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deletePromotion = async (id) => {
    try {
        const response = await APIAUTH.delete(`/promotions/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
