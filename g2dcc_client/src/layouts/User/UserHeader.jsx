import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { useUser } from "../../context/UserContext";
import {
  IoSunnyOutline,
  IoMoonOutline,
  IoCartOutline,
  IoHeartOutline,
  IoSearchOutline,
  IoMenuOutline,
  IoCloseOutline,
} from "react-icons/io5";
import {
  Avatar,
  Badge,
  Button,
  Dropdown,
  Input,
  Menu,
  Space,
  Drawer,
  AutoComplete,
  Spin,
} from "antd";
import user_default from "../../assets/Images/img_user_default.png";
import logo from "../../assets/Images/logoxm.png"; 
import CartBadge from "../../components/common/CartBadge";
import WishlistBadge from "../../components/common/WishlistBadge";
import { useAuth } from "../../context/AuthContext";
import { userSearch } from "../../api/search";
import debounce from "lodash/debounce";

const UserHeader = () => {
  const { value, setValue } = useLocalStorage("theme", "light");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { logout } = useAuth();
  const { user, refreshProfile } = useUser();
  const [searchVisible, setSearchVisible] = useState(false);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", value);
  }, [value]);

  const toggleTheme = () => {
    setValue(value === "light" ? "dark" : "light");
  };

  // Xử lý tìm kiếm
  const handleSearch = useCallback(
    debounce(async (value) => {
      if (!value) {
        setSearchResults([]);
        return;
      }

      try {
        setSearchLoading(true);
        const response = await userSearch(value);
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
                    navigate(`/products/${product.id}`);
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
      navigate(`/products/${option.product.id}`);
      setSearchValue("");
      setSearchResults([]);
    }
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" onClick={() => navigate("/profile")}>
        Thông tin cá nhân
      </Menu.Item>
      <Menu.Item key="orders" onClick={() => navigate("/profile/orders")}>
        Đơn hàng của tôi
      </Menu.Item>
      <Menu.Item key="wishlist" onClick={() => navigate("/profile/wishlist")}>
        Sản phẩm yêu thích
      </Menu.Item>
      <Menu.Item key="order-history" onClick={() => navigate("/profile/order-history")}>
       Lịch sử mua hàng
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" onClick={() => handleLogout()}>
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  const mainMenuItems = [
    {
      key: "/",
      label: "Trang chủ",
      onClick: () => navigate("/"),
    },
    {
      key: "/products",
      label: "Sản phẩm",
      onClick: () => navigate("/products"),
    },
    {
      key: "/forum",
      label: "Diễn đàn",
      onClick: () => navigate("/forum"),
    },
    {
      key: "/promotions",
      label: "Khuyến mãi",
      onClick: () => navigate("/promotions"),
    },
    {
      key: "/about",
      label: "Giới thiệu",
      onClick: () => navigate("/about"),
    },
  ];

  const handleLogout = async () => {
    setLoading(true);
    await logout();
    await refreshProfile();
    navigate("/login");
    setLoading(false);
  };

  return (
    <>
      {loading && <span className="loader-thin"></span>}

      {/* Desktop Header */}
      <header className="bg-ghead shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0 mr-28">
              <img
                src={logo}
                alt="Logo"
                className="h-10 cursor-pointer"
                onClick={() => navigate("/")}
              />
            </div>

            {/* Main Navigation - Desktop */}
            <nav className="hidden md:flex items-center space-x-2">
              {mainMenuItems.map((item) => (
                <button
                  key={item.key}
                  className="text-thead !border-none px-2 py-1 hover:text-primary dark:hover:text-primary font-medium transition-colors"
                  onClick={item.onClick}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Search Bar - Desktop */}
            <div className="hidden md:block flex-1 max-w-md mx-4">
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
                  prefix={<IoSearchOutline className="text-gray-400" />}
                  className="rounded-full"
                  allowClear
                  onClear={() => {
                    setSearchValue("");
                    setSearchResults([]);
                  }}
                />
              </AutoComplete>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {value === "light" ? (
                  <IoMoonOutline className="w-5 h-5 text-gray-700" />
                ) : (
                  <IoSunnyOutline className="w-5 h-5 text-yellow-400" />
                )}
              </button>

              {/* Wishlist */}
              <Link to="/profile/wishlist">
                <WishlistBadge />
              </Link>

              {/* Cart */}
              <Link to="/cart">
                <CartBadge />
              </Link>

              {/* User Avatar */}
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
                <Space>
                  <Button
                    type="text"
                    onClick={() => navigate("/login")}
                    className="text-gray-700 dark:text-gray-200"
                  >
                    Đăng nhập
                  </Button>
                  <Button type="primary" onClick={() => navigate("/login")}>
                    Đăng ký
                  </Button>
                </Space>
              )}

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setMobileMenuVisible(true)}
              >
                <IoMenuOutline className="w-5 h-5 text-gray-700 dark:text-gray-200" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar - Only shown when searchVisible is true */}
        {searchVisible && (
          <div className="md:hidden p-2 bg-gray-50 dark:bg-gray-700">
            <div className="flex items-center">
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
                  prefix={<IoSearchOutline className="text-gray-400" />}
                  className="flex-1"
                  allowClear
                  onClear={() => {
                    setSearchValue("");
                    setSearchResults([]);
                  }}
                />
              </AutoComplete>
              <button
                className="ml-2 p-2"
                onClick={() => {
                  setSearchVisible(false);
                  setSearchValue("");
                  setSearchResults([]);
                }}
              >
                <IoCloseOutline className="w-5 h-5 text-gray-700 dark:text-gray-200" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Menu Drawer */}
      <Drawer
        title="Menu"
        placement="right"
        closable={true}
        onClose={() => setMobileMenuVisible(false)}
        visible={mobileMenuVisible}
        className="dark:bg-gray-800"
      >
        <div className="flex flex-col space-y-4">
          {/* Search Button for Mobile */}
          <button
            className="flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => {
              setMobileMenuVisible(false);
              setSearchVisible(true);
            }}
          >
            <IoSearchOutline className="w-5 h-5 mr-2 text-gray-700 dark:text-gray-200" />
            <span>Tìm kiếm</span>
          </button>

          {/* Main Menu Items */}
          {mainMenuItems.map((item) => (
            <button
              key={item.key}
              className="text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
              onClick={() => {
                item.onClick();
                setMobileMenuVisible(false);
              }}
            >
              {item.label}
            </button>
          ))}

          {/* User Actions for Mobile */}
          <div className="border-t pt-4 mt-4">
            {user ? (
              <>
                <button
                  className="w-full text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                  onClick={() => navigate("/profile")}
                >
                  Tài khoản của tôi
                </button>
                <button
                  className="w-full text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                  onClick={() => navigate("/profile/wishlist")}
                >
                  Yêu thích
                </button>
                <button
                  className="w-full text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                  onClick={() => navigate("/profile/orders")}
                >
                  Đơn hàng
                </button>
                <button
                  className="w-full text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                  onClick={() => navigate("/profile/order-history")}
                >
                  Lịch sử mua hàng
                </button>
                <button
                  className="w-full text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"
                  onClick={handleLogout}
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <div className="flex space-x-2">
                <Button
                  block
                  onClick={() => {
                    navigate("/login");
                    setMobileMenuVisible(false);
                  }}
                >
                  Đăng nhập
                </Button>
                <Button
                  block
                  type="primary"
                  onClick={() => {
                    navigate("/login");
                    setMobileMenuVisible(false);
                  }}
                >
                  Đăng ký
                </Button>
              </div>
            )}
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default UserHeader;
