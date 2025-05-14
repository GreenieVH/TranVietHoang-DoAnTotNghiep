import React from "react";
import { Menu } from "antd";
import {
  HomeOutlined,
  TeamOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
  TagsOutlined,
  GiftOutlined,
  BarcodeOutlined,
  PictureOutlined,
  FireOutlined,
  SettingOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";

function AdminNavbar({ collapsed }) {
  const navigate = useNavigate();
  const [openKeys, setOpenKeys] = React.useState([]);
  const { user } = useUser();

  const isAdmin = user?.role === 'admin';

  const items = [
    {
      key: "home",
      label: "Tổng quan",
      icon: <HomeOutlined />,
      onClick: () => navigate("/admin"),
    },
    ...(isAdmin ? [{
      key: "user-management",
      label: "Quản lý người dùng",
      icon: <TeamOutlined />,
      children: [
        {
          key: "user-list",
          label: "Danh sách người dùng",
          onClick: () => navigate("/admin/user-lists"),
        },
        {
          key: "staff-list",
          label: "Danh sách nhân viên",
          onClick: () => navigate("/admin/staff-lists"),
        },
      ],
    }] : []),
    {
      key: "statistical",
      label: "Thống kê",
      icon: <AppstoreOutlined />,
      children: [
        {
          key: "order",
          label: "Đơn hàng",
          icon: <TagsOutlined />,
          onClick: () => navigate("/admin/order-statistics"),
        },
        {
          key: "user",
          label: "Người dùng",
          icon: <BarcodeOutlined />,
          onClick: () => navigate("/admin/dashboard"),
        }
      ],
    },
    {
      key: "catalog",
      label: "Quản lý sản phẩm",
      icon: <AppstoreOutlined />,
      children: [
        {
          key: "category",
          label: "Danh mục",
          icon: <TagsOutlined />,
          onClick: () => navigate("/admin/category-lists"),
        },
        {
          key: "product",
          label: "Sản phẩm",
          icon: <BarcodeOutlined />,
          onClick: () => navigate("/admin/product-lists"),
        },
        {
          key: "brand",
          label: "Thương hiệu",
          icon: <GiftOutlined />,
          onClick: () => navigate("/admin/brand-lists"),
        },
      ],
    },
    {
      key: "sales",
      label: "Quản lý bán hàng",
      icon: <ShoppingCartOutlined />,
      children: [
        {
          key: "orders",
          label: "Đơn hàng",
          onClick: () => navigate("/admin/orders"),
        },
        {
          key: "promotion",
          label: "Khuyến mãi",
          icon: <FireOutlined />,
          onClick: () => navigate("/admin/promotion-lists"),
        },
      ],
    },
    {
      key: "marketing",
      label: "Marketing",
      icon: <PictureOutlined />,
      children: [
        {
          key: "banner",
          label: "Quản lý banner",
          onClick: () => navigate("/admin/banner-lists"),
        },
      ],
    },
    {
      key: "settings",
      label: "Cài đặt",
      icon: <SettingOutlined />,
      children: [
        {
          key: "general",
          label: "Cài đặt chung",
          onClick: () => navigate("/admin/settings"),
        },
      ],
    },
  ];

  return (
    <div className={`bg-white text-black transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} h-[calc(100vh-3.5rem)] shadow-md shadow-gray-600`}>
      <Menu
        mode="inline"
        items={items}
        openKeys={openKeys}
        onOpenChange={(keys) => setOpenKeys(keys)}
        className="border-r-0 h-full"
        inlineCollapsed={collapsed}
      />
    </div>
  );
}

export default AdminNavbar;
