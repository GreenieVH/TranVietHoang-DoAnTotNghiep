import { createContext, useContext, useState, useEffect } from "react";
import { getAllUsers, getUserProfile, updatedUser } from "../api/user";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(false);
  const isAuthenticated = localStorage.getItem("user");

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await getUserProfile();
        const userInfo = {
          id: res.id,
          username: res.username,
          email: res.email,
          role: res.role_name,
          sex: res.sex,
          img: res.img,
          phone: res.phone,
          address: res.address,
          created_at: res.created_at,
        };
        setUser(userInfo);
        localStorage.setItem("user_detail", JSON.stringify(userInfo));
      } catch (error) {
        console.error("Lỗi khi lấy profile:", error.message);
        setUser(null);
        localStorage.removeItem("user_detail");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchAllUsers = async () => {
      try {
        const res = await getAllUsers();
        setUsers(res);
      } catch (error) {
        console.error("Lỗi khi lấy users:", error);
        setUser(null);
      }
    };
    fetchAllUsers();
  }, [isAuthenticated]);

  const refreshAllUsers = async () => {
    try {
      const res = await getAllUsers();
      setUsers(res);
    } catch (error) {
      console.error("Lỗi khi lấy users:", error);
      setUser(null);
    }
  };
  const refreshProfile = async () => {
    try {
      const res = await getUserProfile();
      setUser(res);
    } catch (error) {
      console.error("Lỗi khi làm mới profile:", error.message);
    }
  };
  const refreshUserLists = async () => {
    try {
      const res = await getAllUsers();
      setUsers(res);
    } catch (error) {
      console.error("Lỗi khi làm mới profile:", error.message);
    }
  };

  const updateUser = async (id, newData, isImage) => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await updatedUser(id, newData, isImage);
      return res;
    } catch (error) {
      console.error("Lỗi khi làm mới profile:", error.message);
      throw error
    } finally{
      setLoading(false);
    }
  };
  return (
    <UserContext.Provider
      value={{
        user,
        users,
        loading,
        refreshProfile,
        refreshUserLists,
        updateUser,
        refreshAllUsers,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
