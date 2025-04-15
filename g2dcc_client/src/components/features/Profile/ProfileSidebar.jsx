import { Layout, Menu, Avatar } from "antd";
import {
  UserOutlined,
  HeartOutlined,
  ShoppingCartOutlined,
  ClockCircleOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import { useUser } from "../../../context/UserContext";

const { Sider } = Layout;

export default function ProfileSidebar() {
  const { user } = useUser();
  const location = useLocation();

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.includes("wishlist")) return "wishlist";
    if (path.includes("orders")) return "orders";
    if (path.includes("saved")) return "saved";
    if (path.includes("security")) return "security";
    return "profile";
  };

  return (
    <Sider
      width={250}
      theme="light"
      className="rounded-l-lg border-r h-screen sticky top-0 overflow-y-auto"
      breakpoint="lg"
      collapsedWidth="0"
    >
      <div className="p-4 flex flex-col items-center border-b">
        <Avatar
          size={64}
          src={
            user?.img?.startsWith("http")
              ? user.img
              : `http://localhost:4000${user?.img}`
          }
          icon={<UserOutlined />}
          className="mb-3"
        />
        <h3 className="font-semibold">{user?.username}</h3>
        <p className="text-gray-500 text-sm">{user?.email}</p>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        className="border-0"
      >
        <Menu.Item key="profile" icon={<UserOutlined />}>
          <Link to="/profile">Thông tin tài khoản</Link>
        </Menu.Item>
        <Menu.Item key="wishlist" icon={<HeartOutlined />}>
          <Link to="/profile/wishlist">Danh sách yêu thích</Link>
        </Menu.Item>
        <Menu.Item key="orders" icon={<ShoppingCartOutlined />}>
          <Link to="/profile/orders">Đơn hàng của tôi</Link>
        </Menu.Item>
        <Menu.Item key="saved" icon={<ClockCircleOutlined />}>
          <Link to="/profile/saved">Danh sách xem sau</Link>
        </Menu.Item>
        <Menu.Item key="security" icon={<LockOutlined />}>
          <Link to="/profile/security">Bảo mật</Link>
        </Menu.Item>
      </Menu>
    </Sider>
  );
}