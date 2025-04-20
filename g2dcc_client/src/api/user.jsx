import APIAUTH from '@/config/apiAuth';

export const getUserProfile = async () => {
  const user = localStorage.getItem("user");
  if (!user) return;
  try {
    const res = await APIAUTH.get("/users/profile");
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getAllUsers = async () => {
  try {
    const res = await APIAUTH.get("/users/all");
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const updatedUser = async (id, newData, isImage = false) => {
  try {
    let res;

    if (isImage) {
      res = await APIAUTH.put(`/users/updateduser/${id}`, newData, {
        headers: { "Content-Type": "multipart/form-data" }, // Không đặt Content-Type
      });
    } else {
      res = await APIAUTH.put(`/users/updateduser/${id}`, newData);
    }

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const fetchStats = async () => {
  try {
    const res = await APIAUTH.get("/users/stats"); // API trả về nhiều thống kê
    return res.data;
  } catch (error) {
    throw error
  } 
};
