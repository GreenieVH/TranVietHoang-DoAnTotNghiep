import { createContext, useContext, useEffect, useState } from "react";
import { LoginUser, LogoutUser } from "../api/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (username, password) => {
    try {
      const res = await LoginUser({ username, password });
      const { accessToken } = res;

      localStorage.setItem("user", JSON.stringify({ username, accessToken }));
      setUser({ username, accessToken });
      return res;
    } catch (error) {
      throw error.message;
    }
  };
  const logout = async () => {
    try {
      const res = await LogoutUser();
      localStorage.removeItem("user");
      localStorage.removeItem("user_detail");
      setUser(null);
      return res;
    } catch (error) {
      throw error.message;
    }
  };
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
