import React, { useState, useCallback } from "react";
import { CgMenuLeft, CgMenu } from "react-icons/cg";
import { PiMagnifyingGlassBold } from "react-icons/pi";
import { FaRegBell } from "react-icons/fa";
import { MdOutlineEmail } from "react-icons/md";
import { useUser } from "@/context/UserContext";
import { Avatar, Dropdown, Menu, Input, AutoComplete, Spin } from "antd";
import user_default from "@/assets/Images/img_user_default.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { adminSearch } from "@/api/search";
import debounce from "lodash/debounce";

function AdminHeader({ onMenuCollapse, collapsed }) {
  const { user } = useUser();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Xử lý tìm kiếm
  const handleSearch = useCallback(
    debounce(async (value) => {
      if (!value) {
        setSearchResults([]);
        return;
      }

      try {
        setSearchLoading(true);
        const response = await adminSearch(value);
        if (response.success) {
          const products = response.data.results.products || [];
          console.log(products);
          setSearchResults(
            products.map((product) => ({
              value: product.title,
              label: (
                <div 
                  className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => {
                    navigate(`/admin/products/${product.id}`);
                    setSearchValue("");
                    setSearchResults([]);
                  }}
                >
                  <img
                    src={product.img || ""}
                    alt={product.title}
                    className="w-10 h-10 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{product.title}</div>
                    <div className="text-sm text-gray-500">
                      {product.price?.toLocaleString("vi-VN")}đ
                    </div>
                  </div>
                </div>
              ),
              product: product,
            }))
          );
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setSearchLoading(false);
      }
    }, 500),
    [navigate]
  );

  const onSearchSelect = (value, option) => {
    if (option.product) {
      navigate(`/admin/products/${option.product.id}`);
      setSearchValue("");
      setSearchResults([]);
    }
  };

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
    <div className="flex justify-between items-center px-6 bg-amber-400 h-14 border-b">
      <div className="flex items-center gap-6">
        <div className="text-lg font-semibold">G2DCC Admin</div>
        <div onClick={() => onMenuCollapse(!collapsed)} className="cursor-pointer hover:text-blue-500">
          {collapsed ? (
            <CgMenu className="w-6 h-6" />
          ) : (
            <CgMenuLeft className="w-6 h-6" />
          )}
        </div>
        <div className="w-64">
          <AutoComplete
            value={searchValue}
            options={searchResults}
            onSelect={onSearchSelect}
            onChange={(value) => {
              setSearchValue(value);
              handleSearch(value);
            }}
            notFoundContent={searchLoading ? <Spin size="small" /> : null}
            className="w-full"
            dropdownClassName="search-dropdown"
            dropdownMatchSelectWidth={true}
            open={searchValue.length > 0}
            onDropdownVisibleChange={(open) => {
              if (!open) {
                setSearchResults([]);
              }
            }}
          >
            <Input
              placeholder="Tìm kiếm sản phẩm..."
              prefix={<PiMagnifyingGlassBold className="text-gray-400" />}
              className="rounded-full"
              allowClear
              onClear={() => {
                setSearchValue("");
                setSearchResults([]);
              }}
            />
          </AutoComplete>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="cursor-pointer hover:text-blue-500">
          <FaRegBell className="w-5 h-5" />
        </div>
        <div className="cursor-pointer hover:text-blue-500">
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
