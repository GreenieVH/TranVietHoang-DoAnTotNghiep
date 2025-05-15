import React, { useState, useCallback } from "react";
import { CgMenuLeft, CgMenu } from "react-icons/cg";
import { PiMagnifyingGlassBold } from "react-icons/pi";
import { FaRegBell } from "react-icons/fa";
import { MdOutlineEmail } from "react-icons/md";
import { BsBox, BsPerson, BsCart, BsTag } from "react-icons/bs";
import { useUser } from "@/context/UserContext";
import { Avatar, Dropdown, Menu, Input, AutoComplete, Spin, Divider } from "antd";
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
          const results = response.data.results;
          const groupedResults = [];

          // Thêm sản phẩm
          if (results.products?.length > 0) {
            groupedResults.push({
              label: (
                <div className="font-semibold text-gray-500 px-2 py-1 flex items-center gap-2">
                  <BsBox className="w-4 h-4" />
                  Sản phẩm
                </div>
              ),
              options: results.products.map((product) => ({
                value: product.title,
                label: (
                  <div 
                    className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => {
                      navigate(`/admin/products?search=${encodeURIComponent(product.title)}`);
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
              })),
            });
          }

          // Thêm người dùng
          if (results.users?.length > 0) {
            groupedResults.push({
              label: (
                <div className="font-semibold text-gray-500 px-2 py-1 flex items-center gap-2">
                  <BsPerson className="w-4 h-4" />
                  Người dùng
                </div>
              ),
              options: results.users.map((user) => ({
                value: user.title,
                label: (
                  <div 
                    className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => {
                      navigate(`/admin/user-lists?search=${encodeURIComponent(user?.title)}`);
                      setSearchValue("");
                      setSearchResults([]);
                    }}
                  >
                    <Avatar
                      src={user.img || user_default}
                      size="small"
                      className="!w-10 !h-10"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{user.title}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                ),
                user: user,
              })),
            });
          }

          // Thêm đơn hàng
          if (results.orders?.length > 0) {
            groupedResults.push({
              label: (
                <div className="font-semibold text-gray-500 px-2 py-1 flex items-center gap-2">
                  <BsCart className="w-4 h-4" />
                  Đơn hàng
                </div>
              ),
              options: results.orders.map((order) => ({
                value: `Đơn hàng #${order.id}`,
                label: (
                  <div 
                    className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => {
                      navigate(`/admin/orders?search=${encodeURIComponent(order.status)}`);
                      setSearchValue("");
                      setSearchResults([]);
                    }}
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                      <BsCart className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">Đơn hàng #{order.id}</div>
                      <div className="text-sm text-gray-500">
                        {order.total?.toLocaleString("vi-VN")}đ - {order.status}
                      </div>
                    </div>
                  </div>
                ),
                order: order,
              })),
            });
          }

          // Thêm danh mục
          if (results.categories?.length > 0) {
            groupedResults.push({
              label: (
                <div className="font-semibold text-gray-500 px-2 py-1 flex items-center gap-2">
                  <BsTag className="w-4 h-4" />
                  Danh mục
                </div>
              ),
              options: results.categories.map((category) => ({
                value: category.name,
                label: (
                  <div 
                    className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => {
                      navigate(`/admin/category-lists?search=${encodeURIComponent(category.title)}`);
                      setSearchValue("");
                      setSearchResults([]);
                    }}
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                      <BsTag className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{category.title}</div>
                      <div className="text-sm text-gray-500">
                        {category.productCount || 0} sản phẩm
                      </div>
                    </div>
                  </div>
                ),
                category: category,
              })),
            });
          }

          setSearchResults(groupedResults);
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
      navigate(`/admin/product-lists?search=${encodeURIComponent(option.product.title)}`);
    } else if (option.user) {
      navigate(`/admin/user-lists?search=${encodeURIComponent(option.user.title)}`);
    } else if (option.order) {
      navigate(`/admin/orders?search=${encodeURIComponent(option.order.status)}`);
    } else if (option.category) {
      navigate(`/admin/category-lists?search=${encodeURIComponent(option.category.title)}`);
    }
    setSearchValue("");
    setSearchResults([]);
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
              placeholder="Tìm kiếm..."
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
