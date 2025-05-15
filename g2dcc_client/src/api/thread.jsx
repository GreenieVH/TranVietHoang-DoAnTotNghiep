import APIAUTH from '@/config/apiAuth';
import API from '@/config/api';

export const getAllThread = async () => {
    try {
        const res = await API.get("/threads/all");
        return res.data;
    } catch (error) {
        throw error.response.data;
    }
}

export const getAllMessageThread = async (thread_id) => {
    try {
        const res = await API.get(`/threads/all/message?thread_id=${thread_id}`);
        return res.data;
    } catch (error) {
        throw error.response.data;
    }
}

export const createThread = async (formData) => {
    try {
        const res = await APIAUTH.post("/threads/create", formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return res.data;
    } catch (error) {
        throw error.response.data;
    }
}

export const createMessageThread = async (formData) => {
    try {
        const res = await APIAUTH.post("/threads/create/message", formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return res.data;
    } catch (error) {
        throw error.response.data;
    }
}

export const updateThread = async (id, formData) => {
    try {
        const res = await APIAUTH.put(`/threads/update/thread/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return res.data;
    } catch (error) {
        throw error.response.data;
    }
}

export const updateMessage = async (id, formData) => {
    try {
        const res = await APIAUTH.put(`/threads/update/message/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return res.data;
    } catch (error) {
        throw error.response.data;
    }
}

export const deleteThread = async (id) => {
    try {
        const res = await APIAUTH.delete(`/threads/delete/thread/${id}`);
        return res.data;
    } catch (error) {
        throw error.response.data;
    }
}

export const deleteMessage = async (id) => {
    try {
        const res = await APIAUTH.delete(`/threads/delete/message/${id}`);
        return res.data;
    } catch (error) {
        throw error.response.data;
    }
}
