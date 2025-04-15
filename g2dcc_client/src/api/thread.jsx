import axios from "axios";
const baseURL = import.meta.env.VITE_BASE_URL;

const API = axios.create({
  baseURL: baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// 🔥 Tự động thêm Bearer Token vào tất cả request
API.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem("user")); // Lấy user từ localStorage
    if (user?.accessToken) {
      config.headers.Authorization = `Bearer ${user.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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
