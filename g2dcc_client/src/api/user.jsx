import axios from "axios";
const baseURL = process.env.BASE_URL;

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
// 🔥 Xử lý khi access token hết hạn (401)
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 403) {
      try {
        // Gửi refresh token để lấy access token mới
        const res = await API.post("/auth/token");

        const newAccessToken = res.data.accessToken;
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...JSON.parse(localStorage.getItem("user")),
            accessToken: newAccessToken,
          })
        );

        const originalRequest = { ...error.config };
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return API.request(originalRequest); // Gửi lại request cũ với token mới
      } catch (refreshError) {
        localStorage.removeItem("user"); // Nếu refresh token cũng hết hạn, logout
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const getUserProfile = async () => {
  const user = localStorage.getItem("user");
  if (!user) return;
  try {
    const res = await API.get("/users/profile");
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getAllUsers = async () => {
  try {
    const res = await API.get("/users/all");
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const updatedUser = async (id, newData, isImage = false) => {
  try {
    let res;

    if (isImage) {
      res = await API.put(`/users/updateduser/${id}`, newData, {
        headers: { "Content-Type": "multipart/form-data" }, // Không đặt Content-Type
      });
    } else {
      res = await API.put(`/users/updateduser/${id}`, newData);
    }

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const fetchStats = async () => {
  try {
    const res = await API.get("/users/stats"); // API trả về nhiều thống kê
    return res.data;
  } catch (error) {
    throw error
  } 
};
