import APIAUTH from '@/config/apiAuth';

export const getAllThread = async () => {
    try {
        const res = await APIAUTH.get("/threads/all");
        return res.data;
    } catch (error) {
        throw error.response.data;
    }
}

export const getAllMessageThread = async (thread_id) => {
    try {
        const res = await APIAUTH.get(`/threads/all/message?thread_id=${thread_id}`);
        return res.data;
    } catch (error) {
        throw error.response.data;
    }
}
