import React from "react";
import { useNavigate } from "react-router-dom";
import Dashboard from "../../components/features/Admin/Dashboard";
import OrderStatistics from "../../components/features/Order/OrderStatistics";
import { ArrowLeftOutlined, LeftOutlined } from "@ant-design/icons";
import { Button } from "antd/es/radio";

function AdminHome() {
  const navigate = useNavigate()
  return (
    <div className="w-4/5 p-5 relative">
      <Button
        type="default"
        className="px-2 py-1"
        onClick={() => navigate("/")}
        icon={<LeftOutlined />}
      >
        Trở về trang chủ
      </Button>
      <Dashboard />
      <OrderStatistics />
    </div>
  );
}

export default AdminHome;
