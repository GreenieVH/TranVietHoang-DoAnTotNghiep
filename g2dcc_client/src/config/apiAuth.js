import axios from "axios";

const baseURL = import.meta.env.VITE_BASE_URL;

const APIAUTH = axios.create({
  baseURL: baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// 🔐 Thêm Bearer Token vào mọi request
APIAUTH.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.accessToken) {
      config.headers.Authorization = `Bearer ${user.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Biến để theo dõi trạng thái refresh token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ♻️ Tự động refresh token khi bị 403
APIAUTH.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi không phải 403 hoặc request đã retry thì reject
    if (error.response?.status !== 403 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Nếu đang refresh token thì thêm request vào queue
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return APIAUTH.request(originalRequest);
        })
        .catch(err => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Tạo 1 axios instance tạm để gọi refresh token
      const refreshAPI = axios.create({ baseURL, withCredentials: true });
      const res = await refreshAPI.post("/auth/token");
      const newAccessToken = res.data.accessToken;

      const currentUser = JSON.parse(localStorage.getItem("user"));
      localStorage.setItem(
        "user",
        JSON.stringify({ ...currentUser, accessToken: newAccessToken })
      );

      // Cập nhật header cho request gốc
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      
      // Xử lý các request đang chờ
      processQueue(null, newAccessToken);
      
      return APIAUTH.request(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      localStorage.removeItem("user");
      window.location.href = "/login"; // Chuyển về trang login khi refresh thất bại
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default APIAUTH;
