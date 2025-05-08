import React, { useState } from 'react';
import { Form, Input, Button, DatePicker, Switch, Select, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useToast } from '../../../context/ToastContext';
import { createBanner, updateBanner } from '../../../api/banners';
import dayjs from 'dayjs';

const { TextArea } = Input;

const BannerForm = ({ banner, onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const showToast = useToast();

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const formData = new FormData();
      
      // Thêm các trường dữ liệu vào formData
      formData.append('title', values.title);
      formData.append('redirectUrl', values.redirectUrl);
      formData.append('displayOrder', values.displayOrder);
      formData.append('isActive', values.isActive);
      formData.append('bannerType', values.bannerType);
      
      // Xử lý ngày tháng
      if (values.startDate) {
        formData.append('startDate', values.startDate.toISOString());
      }
      if (values.endDate) {
        formData.append('endDate', values.endDate.toISOString());
      }

      // Thêm ảnh nếu có
      if (imageFile) {
        formData.append('bannerImage', imageFile);
      } else if (!banner) {
        // Nếu là tạo mới và không có ảnh
        showToast('Vui lòng tải lên hình ảnh banner', 'error');
        setLoading(false);
        return;
      }

      let response;
      if (banner) {
        // Cập nhật banner
        response = await updateBanner(banner.id, formData);
        showToast('Cập nhật banner thành công', 'success');
      } else {
        // Tạo banner mới
        response = await createBanner(formData);
        showToast('Tạo banner mới thành công', 'success');
      }

      onSuccess(response.data);
      form.resetFields();
      setImageFile(null);
    } catch (error) {
      showToast(error.response?.data?.message || 'Có lỗi xảy ra', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (info) => {
    // Lấy file từ info.fileList
    const file = info.fileList[0]?.originFileObj;
    if (file) {
      setImageFile(file);
      message.success(`${file.name} đã được tải lên thành công`);
    } else {
      setImageFile(null);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={banner ? {
        ...banner,
        startDate: banner.startDate ? dayjs(banner.startDate) : null,
        endDate: banner.endDate ? dayjs(banner.endDate) : null,
      } : {
        isActive: true,
        displayOrder: 0,
        bannerType: 'main'
      }}
    >
      <Form.Item
        name="title"
        label="Tiêu đề"
        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="bannerType"
        label="Loại banner"
        rules={[{ required: true, message: 'Vui lòng chọn loại banner' }]}
      >
        <Select>
          <Select.Option value="main">Banner chính</Select.Option>
          <Select.Option value="sub">Banner phụ</Select.Option>
          <Select.Option value="promotion">Khuyến mãi</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="redirectUrl"
        label="URL chuyển hướng"
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="displayOrder"
        label="Thứ tự hiển thị"
        rules={[{ required: true, message: 'Vui lòng nhập thứ tự hiển thị' }]}
      >
        <Input type="number" min={0} />
      </Form.Item>

      <Form.Item
        name="startDate"
        label="Ngày bắt đầu"
      >
        <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
      </Form.Item>

      <Form.Item
        name="endDate"
        label="Ngày kết thúc"
      >
        <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
      </Form.Item>

      <Form.Item
        name="isActive"
        label="Trạng thái"
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>

      <Form.Item
        label="Hình ảnh"
        required={!banner}
      >
        <Upload
          accept="image/*"
          beforeUpload={() => false}
          onChange={handleImageChange}
          maxCount={1}
          listType="picture"
          fileList={imageFile ? [{ uid: '-1', name: imageFile.name, status: 'done', url: URL.createObjectURL(imageFile) }] : []}
        >
          <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
        </Upload>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          {banner ? 'Cập nhật' : 'Tạo mới'}
        </Button>
        <Button style={{ marginLeft: 8 }} onClick={onCancel}>
          Hủy
        </Button>
      </Form.Item>
    </Form>
  );
};

export default BannerForm; 