import React from 'react';
import { Modal, Form, Input, Button, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const BrandForm = ({ visible, onCancel, onSubmit, initialValues }) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    } else {
      form.resetFields();
    }
  }, [initialValues, form]);

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <Modal
      title={initialValues ? 'Chỉnh sửa thương hiệu' : 'Thêm thương hiệu'}
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Xác nhận
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Tên thương hiệu"
          rules={[{ required: true, message: 'Vui lòng nhập tên thương hiệu!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả"
        >
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item
          name="logo_url"
          label="Đường dẫn logo"
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="website_url"
          label="Đường dẫn website"
          rules={[{ type: 'url', message: 'Vui lòng nhập đường dẫn website hợp lệ!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="isActive"
          label="Trạng thái"
          valuePropName="checked"
          initialValue={true}
        >
          <Input type="checkbox" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BrandForm;