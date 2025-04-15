import axios from "axios";
const baseURL = process.env.BASE_URL;

const API = axios.create({
  baseURL: baseURL,
  headers: { "Content-Type": "application/json" },
});
const AUTHAPI = axios.create({
  baseURL: baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export const registerUser = async (formData) => {
  try {
    const res = await API.post("/auth/register", formData);
    return res.data;
  } catch (error) {
    throw error.response.data || { message: "loi server" };
  }
};

export const LoginUser = async (formData) => {
  try {
    const res = await AUTHAPI.post("/auth/login", formData);
    return res.data;
  } catch (error) {
    throw error.response.data || { message: "loi server" };
  }
};

export const LogoutUser = async () => {
  try {
    const res = await AUTHAPI.post("/auth/logout");
    return res.data;
  } catch (error) {
    throw error.response.data || { message: "loi server" };
  }
};

export const loginWithGoogle = async (token) => {
  try {
    const res = await AUTHAPI.post("/auth/google-login", { token });
    return res.data;
  } catch (error) {
    throw error.response.data || { message: "Đăng nhập thất bại" };
  }
};
