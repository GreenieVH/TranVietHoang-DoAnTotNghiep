import { useEffect, useState } from "react";
import { Card, Col, Row, Spin } from "antd";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { fetchStats } from "../../../api/user";

// Màu tương ứng từng loại user
const COLORS = ["#f5222d", "#fa8c16", "#52c41a"];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const getStats = async () => {
      try {
        const stats = await fetchStats();
        setStats(stats);
      } catch (error) {
        console.error("Lỗi khi lấy thống kê:", error.message);
      } finally {
        setLoading(false);
      }
    };
    getStats();
  }, []);

  const userRoleData = [
    { name: "Admin", value: stats?.adminCount || 0 },
    { name: "Staff", value: stats?.staffCount || 0 },
    { name: "Customer", value: stats?.customerCount || 0 },
  ];

  const userStatusData = [
    { name: "Hoạt động", value: stats?.activeCount || 0 },
    { name: "Bị khóa", value: stats?.inactiveCount || 0 },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card
            title={`Tỉ lệ tài khoản theo vai trò (Tổng: ${
              stats?.totalUsers || 0
            })`}
          >
            {loading ? (
              <Spin />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={userRoleData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                    dataKey="value"
                  >
                    {userRoleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Tình trạng tài khoản">
            {loading ? (
              <Spin />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#1890ff" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>
        <Col xs={24}>
          <Card title="Người dùng đăng ký theo tháng">
            {loading ? (
              <Spin />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats?.registrationsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Số lượng" fill="#1890ff" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
