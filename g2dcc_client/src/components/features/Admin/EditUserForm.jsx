import React, { useEffect } from "react";
import { Modal, Form, Input, Select } from "antd";

const { Option } = Select;

function EditUserForm({ user, onSave, onCancel }) {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      username: user.username,
      email: user.email,
      role: user.role_name,
    });
  }, [user, form]);

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        onSave(user.id, values);
      })
      .catch((info) => {
        console.log("Validation Failed:", info);
      });
  };

  return (
    <Modal
      title="Chỉnh sửa người dùng"
      open={true}
      onOk={handleOk}
      onCancel={onCancel}
      okText="Lưu"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical">
        <Form.Item label="ID">
          <Input value={user.id} readOnly />
        </Form.Item>

        <Form.Item
          name="username"
          label="Tên người dùng"
          rules={[{ required: true, message: "Vui lòng nhập tên người dùng" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[{ required: true, type: "email", message: "Email không hợp lệ" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="role"
          label="Vai trò"
          rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
        >
          <Select placeholder="Chọn vai trò">
            <Option value="admin">Admin</Option>
            <Option value="staff">Staff</Option>
            <Option value="customer">Customer</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default EditUserForm;
