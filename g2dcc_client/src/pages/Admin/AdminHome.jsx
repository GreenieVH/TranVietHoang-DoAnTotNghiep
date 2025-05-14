import React from "react";
import { useNavigate } from "react-router-dom";
import { LeftOutlined, ShoppingOutlined, BarChartOutlined, UserOutlined, SettingOutlined } from "@ant-design/icons";
import { Button, Card, Row, Col, Space } from "antd";

function AdminHome() {
  const navigate = useNavigate();

  const quickLinks = [
    {
      title: "Quản lý đơn hàng",
      description: "Xem và quản lý tất cả đơn hàng",
      icon: <ShoppingOutlined style={{ fontSize: 24 }} />,
      path: "/admin/orders"
    },
    {
      title: "Thống kê",
      description: "Xem báo cáo và thống kê chi tiết",
      icon: <BarChartOutlined style={{ fontSize: 24 }} />,
      path: "/admin/order-statistics"
    },
    {
      title: "Quản lý người dùng",
      description: "Quản lý tài khoản người dùng",
      icon: <UserOutlined style={{ fontSize: 24 }} />,
      path: "/admin/user-lists"
    },
    {
      title: "Cài đặt",
      description: "Cấu hình hệ thống",
      icon: <SettingOutlined style={{ fontSize: 24 }} />,
      path: "/admin/settings"
    }
  ];

  return (
    <div className="w-full p-6">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Trang quản trị</h1>
          <Button
            type="default"
            onClick={() => navigate("/")}
            icon={<LeftOutlined />}
          >
            Trở về trang chủ
          </Button>
        </div>

        <Card>
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Chào mừng đến với trang quản trị</h2>
            <p className="text-gray-600">
              Đây là trang quản trị của hệ thống G2DCC. Tại đây bạn có thể quản lý đơn hàng, 
              xem thống kê, quản lý người dùng và cấu hình hệ thống.
            </p>
          </div>

          <Row gutter={[16, 16]}>
            {quickLinks.map((link, index) => (
              <Col xs={24} sm={12} md={6} key={index}>
                <Card
                  hoverable
                  className="h-full"
                  onClick={() => navigate(link.path)}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="text-blue-500 mb-3">
                      {link.icon}
                    </div>
                    <h3 className="font-medium mb-2">{link.title}</h3>
                    <p className="text-gray-500 text-sm">{link.description}</p>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      </Space>
    </div>
  );
}

export default AdminHome;
