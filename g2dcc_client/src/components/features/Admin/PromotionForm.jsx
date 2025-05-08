// src/pages/admin/promotions/PromotionForm.jsx
import React, { useEffect } from 'react';
import { Modal,Button, Form, Input, InputNumber, DatePicker, Switch, Select, message } from 'antd';
import { createPromotion, updatePromotion } from '@/api/promotions';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const PromotionForm = ({ initialValues, onClose, onSuccess }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        is_active: initialValues.is_active,
        usage_limit: initialValues.usage_limit,
        discount_type: initialValues.discount_type,
        discount_value: initialValues.discount_value,
        dateRange: [dayjs(initialValues.start_date), dayjs(initialValues.end_date)],
      });
    } else {
      form.resetFields();
    }
  }, [initialValues]);

  const handleFinish = async (values) => {
    const data = {
      code: values.code,
      name: values.name,
      description: values.description,
      discount_type: values.discount_type,
      discount_value: values.discount_value,
      max_discount_amount: values.max_discount_amount,
      min_order_amount: values.min_order_amount,
      start_date: values.dateRange[0].toISOString(),
      end_date: values.dateRange[1].toISOString(),
      is_active: values.is_active,
      usage_limit: values.usage_limit
    };

    try {
      if (initialValues) {
        await updatePromotion(initialValues.id, data);
        message.success('Cập nhật thành công');
      } else {
        await createPromotion(data);
        message.success('Thêm mới thành công');
      }
      onSuccess();
    } catch (err) {
      message.error(err.response?.data?.message || 'Lỗi');
    }
  };

  return (
    <Modal
      title={initialValues ? 'Sửa khuyến mãi' : 'Thêm khuyến mãi'}
      open={true}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
      >
        <Form.Item
          name="code"
          label="Mã khuyến mãi"
          rules={[{ required: true, message: 'Vui lòng nhập mã khuyến mãi' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="name"
          label="Tên khuyến mãi"
          rules={[{ required: true, message: 'Vui lòng nhập tên khuyến mãi' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả"
        >
          <Input.TextArea />
        </Form.Item>

        <Form.Item
          name="discount_type"
          label="Loại giảm giá"
          rules={[{ required: true, message: 'Vui lòng chọn loại giảm giá' }]}
        >
          <Select>
            <Select.Option value="percentage">Phần trăm</Select.Option>
            <Select.Option value="fixed">Số tiền cố định</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="discount_value"
          label="Giá trị giảm giá"
          rules={[{ required: true, message: 'Vui lòng nhập giá trị giảm giá' }]}
        >
          <InputNumber
            min={0}
            style={{ width: '100%' }}
            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value.replace(/\$\s?|(,*)/g, '')}
          />
        </Form.Item>

        <Form.Item
          name="max_discount_amount"
          label="Giảm giá tối đa"
          tooltip="Áp dụng cho giảm giá theo phần trăm"
        >
          <InputNumber
            min={0}
            style={{ width: '100%' }}
            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value.replace(/\$\s?|(,*)/g, '')}
          />
        </Form.Item>

        <Form.Item
          name="min_order_amount"
          label="Đơn hàng tối thiểu"
        >
          <InputNumber
            min={0}
            style={{ width: '100%' }}
            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value.replace(/\$\s?|(,*)/g, '')}
          />
        </Form.Item>

        <Form.Item
          name="dateRange"
          label="Thời gian áp dụng"
          rules={[{ required: true, message: 'Vui lòng chọn thời gian áp dụng' }]}
        >
          <RangePicker
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          name="usage_limit"
          label="Giới hạn sử dụng"
          tooltip="Để trống nếu không giới hạn"
        >
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="is_active"
          label="Trạng thái"
          valuePropName="checked"
          initialValue={true}
        >
          <Switch />
        </Form.Item>

        <Form.Item>
          <div style={{ textAlign: 'right' }}>
            <Button onClick={onClose} style={{ marginRight: 8 }}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              {initialValues ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PromotionForm;
