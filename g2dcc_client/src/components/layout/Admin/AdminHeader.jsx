import React, { useState } from "react";
import { CgMenuLeft, CgMenu } from "react-icons/cg";
import { PiMagnifyingGlassBold } from "react-icons/pi";
import { FaRegBell } from "react-icons/fa";
import { MdOutlineEmail } from "react-icons/md";
import { useUser } from "@/context/UserContext";
import { Avatar, Dropdown, Menu } from "antd";
import user_default from "@/assets/Images/img_user_default.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
function AdminHeader() {
  const { user } = useUser();
  const [isMenu, setIsMenu] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    await logout();
    navigate("/login");
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" onClick={() => navigate("/profile")}>
        Thông tin cá nhân
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" onClick={() => handleLogout()}>
        Đăng xuất
      </Menu.Item>
    </Menu>
  );
  return (
    <div className="flex justify-between px-10 bg-amber-400 h-14">
      <div className="flex justify-start items-center gap-10">
        <div className="cursor-pointer">Dashboard</div>
        <div onClick={() => setIsMenu(!isMenu)} className="cursor-pointer">
          {isMenu ? (
            <CgMenuLeft className="w-5 h-5" />
          ) : (
            <CgMenu className="w-5 h-5" />
          )}
        </div>
        <div className="cursor-pointer">
          <PiMagnifyingGlassBold className="w-5 h-5" />
        </div>
      </div>
      <div className="flex justify-end items-center gap-10">
        <div className="cursor-pointer">
          <FaRegBell className="w-5 h-5" />
        </div>
        <div className="cursor-pointer">
          <MdOutlineEmail className="w-5 h-5" />
        </div>
        {user ? (
          <Dropdown overlay={userMenu} trigger={["click"]}>
            <div className="cursor-pointer">
              <Avatar
                src={
                  user?.img
                    ? user.img.startsWith("http")
                      ? user.img
                      : `http://localhost:4000${user.img}`
                    : user_default
                }
                size="default"
                className="border-2 border-primary !size-12"
              />
            </div>
          </Dropdown>
        ) : (
          <div className="cursor-pointer">
            <img /> Admin
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminHeader;
