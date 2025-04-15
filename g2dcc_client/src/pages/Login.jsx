import React from "react";
import { Card } from "antd";
import LoginForm from "../components/features/LoginForm";

const Login = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card title="Chào mừng bạn" className="w-full max-w-md shadow-lg">
        <LoginForm />
      </Card>
    </div>
  );
};

export default Login;
