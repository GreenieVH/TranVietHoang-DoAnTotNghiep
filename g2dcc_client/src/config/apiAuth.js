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

// ♻️ Tự động refresh token khi bị 403
APIAUTH.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 403) {
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

        const originalRequest = error.config;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return APIAUTH.request(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("user");
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default APIAUTH;
