import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import ProfileSidebar from "../components/features/Profile/ProfileSidebar";

const { Content } = Layout;

export default function ProfilePage() {
  return (
    <div className="bg-gbg min-h-screen">
      <Layout className="bg-white rounded-lg h-content shadow overflow-hidden">
        <ProfileSidebar />
        <Content className="p-6">
          <Outlet />
        </Content>
      </Layout>
    </div>
  );
}