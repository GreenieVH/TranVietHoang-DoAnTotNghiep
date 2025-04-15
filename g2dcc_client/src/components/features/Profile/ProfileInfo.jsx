import { Card, Form, Input, Button, Upload, Select, Avatar } from "antd";
import {
  EditOutlined,
  UserOutlined,
  PhoneOutlined,
  HomeOutlined,
  ManOutlined,
  WomanOutlined,
  CameraOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useUser } from "../../../context/UserContext";
import { useToast } from "../../../context/ToastContext";
import LoadingPage from "../../../components/common/LoadingPage";

const { Option } = Select;

export default function ProfileInfo() {
  const { user, updateUser, refreshProfile, loading } = useUser();
  const showToast = useToast();
  const [form] = Form.useForm();
  const [selectedFile, setSelectedFile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        phone: user.phone || "",
        address: user.address || "",
        sex: user.sex || "",
        img: user.img || "",
      });
    }
  }, [user, form]); // Thêm dependency user và form

  const handleFileChange = (info) => {
    const file = info.file;
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
      form.setFieldsValue({ img: URL.createObjectURL(file) });
    } else {
      setSelectedFile(null);
    }
  };

  const onFinish = async (values) => {
    const data = new FormData();

    // Thêm các trường thông tin
    data.append("phone", values.phone);
    data.append("address", values.address);
    data.append("sex", values.sex);

    // Thêm file ảnh nếu có
    if (selectedFile) {
      data.append("img", selectedFile); // Thêm file gốc
    }

    try {
      const res = await updateUser(user.id, data, !!selectedFile);
      showToast(res.message);
      await refreshProfile();
      setEditing(false);
      setSelectedFile(null);
      setPreviewImage(null); // Xóa preview sau khi upload
    } catch (error) {
      showToast("Cập nhật thất bại", "error");
      console.error("Update error:", error);
    }
  };
  if (loading) {
    return <LoadingPage fullScreen />;
  }
  return (
    <Card
      title="Thông tin cá nhân"
      extra={
        !editing ? (
          <Button icon={<EditOutlined />} onClick={() => setEditing(true)}>
            Chỉnh sửa
          </Button>
        ) : (
          <Button type="primary" onClick={() => form.submit()}>
            Lưu thay đổi
          </Button>
        )
      }
    >
      <Form form={form} onFinish={onFinish} layout="vertical">
        <div className="flex flex-col items-center mb-6">
          <Upload
            accept="image/*"
            showUploadList={false}
            beforeUpload={() => false}
            onChange={handleFileChange}
            disabled={!editing}
          >
            <div className="relative">
              <Avatar
                size={120}
                src={
                  previewImage || // Ưu tiên hiển thị preview
                  (user?.img?.startsWith("http")
                    ? user.img
                    : user?.img
                    ? `http://localhost:4000${user.img}`
                    : null)
                }
                icon={<UserOutlined />}
                className="border-2 border-blue-500"
              />
              {editing && (
                <div className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md">
                  <CameraOutlined className="text-blue-500" />
                </div>
              )}
            </div>
          </Upload>
          <h2 className="text-xl font-semibold mt-4">{user?.username}</h2>
          <p className="text-gray-500">{user?.email}</p>
        </div>

        <Form.Item label="Số điện thoại" name="phone">
          <Input prefix={<PhoneOutlined />} disabled={!editing} />
        </Form.Item>

        <Form.Item label="Địa chỉ" name="address">
          <Input prefix={<HomeOutlined />} disabled={!editing} />
        </Form.Item>

        <Form.Item label="Giới tính" name="sex">
          <Select disabled={!editing}>
            <Option value="male">
              <ManOutlined /> Nam
            </Option>
            <Option value="female">
              <WomanOutlined /> Nữ
            </Option>
            <Option value="other">Khác</Option>
          </Select>
        </Form.Item>
      </Form>
    </Card>
  );
}
