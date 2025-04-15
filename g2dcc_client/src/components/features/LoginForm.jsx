import React, { useState } from "react";
import { Form, Input, Button, Tabs, Divider } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useUser } from "../../context/UserContext";
import { loginWithGoogle, registerUser } from "../../api/auth";
import { GoogleLogin } from "@react-oauth/google";

const { TabPane } = Tabs;

const LoginForm = () => {
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState("login");
  const { refreshProfile } = useUser();

  const navigate = useNavigate();
  const showToast = useToast();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (values) => {
    setIsSubmitting(true);
    try {
      const data = await login(values.username, values.password);
      showToast(data.message);
      refreshProfile();
      navigate("/");
    } catch (err) {
      console.log(err)
      showToast(err || "Đăng nhập thất bại", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (values) => {
    if (values.password !== values.repassword) {
      return showToast("Mật khẩu không khớp!", "error");
    }
    setIsSubmitting(true);
    try {
      const data = await registerUser(values);
      showToast(data.message);
      // Sau khi đăng ký xong, chuyển sang tab đăng nhập
      setActiveTab("login");
      loginForm.resetFields();
    } catch (err) {
      showToast(err || "Đăng ký thất bại", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async (response) => {
    if (response?.credential) {
      const googleToken = response.credential;
      // Gửi token đến server để xử lý và đăng nhập người dùng
      try {
        const data = await loginWithGoogle(googleToken); // Thực hiện gọi API với token
        localStorage.setItem("user", JSON.stringify(data));
        showToast(data.message);
        refreshProfile();
        navigate("/");
      } catch (err) {
        showToast(err.message || "Đăng nhập thất bại", "error");
      }
    }
  };

  return (
    <Tabs activeKey={activeTab} onChange={setActiveTab} centered>
      <TabPane tab="Đăng nhập" key="login">
        <Form form={loginForm} onFinish={handleLogin} layout="vertical">
          <Form.Item
            name="username"
            label="Tên tài khoản"
            rules={[{ required: true, message: "Vui lòng nhập tên tài khoản!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true,message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              block
            >
              Đăng nhập
            </Button>
          </Form.Item>
          <Divider plain>Hoặc</Divider>
          <Form.Item style={{ display: "flex", justifyContent: "center" }}>
            {/* Thêm nút đăng nhập Google */}
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={(error) =>
                showToast("Đăng nhập Google thất bại", "error")
              }
              useOneTap
            />
          </Form.Item>
        </Form>
      </TabPane>

      <TabPane tab="Đăng ký" key="register">
        <Form
          form={registerForm}
          onFinish={handleRegister}
          layout="vertical"
          validateMessages={{
            required: "${label} là bắt buộc!", // Template string với ${label}
            types: {
              email: "${label} không hợp lệ",
            },
          }}
        >
          <Form.Item
            name="username"
            label="Tên tài khoản"
            rules={[
              { required: true, message: "Vui lòng nhập tên tài khoản!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: 'email' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true,message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="repassword"
            label="Nhập lại mật khẩu"
            rules={[{ required: true,message: "Vui lòng nhập lại mật khẩu!" }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              block
            >
              Đăng ký
            </Button>
          </Form.Item>
        </Form>
      </TabPane>
    </Tabs>
  );
};

export default LoginForm;
