import API from '@/config/api';
import APIAUTH from '@/config/apiAuth';

export const getUserAddresses = async () => {
    try {
        const response = await APIAUTH.get('/addresses');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getAddressById = async (id) => {
    try {
        const response = await APIAUTH.get(`/addresses/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createAddress = async (data) => {
    try {
        const response = await APIAUTH.post('/addresses', data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateAddress = async (id, data) => {
    try {
        const response = await APIAUTH.put(`/addresses/${id}`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteAddress = async (id) => {
    try {
        const response = await APIAUTH.delete(`/addresses/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}; 