import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/utils/format';
import { getOrderById, updateShipment } from '@/api/orders';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useToast } from '@/context/ToastContext';
import { 
  Card, 
  Form, 
  Input, 
  Select, 
  Button, 
  Descriptions, 
  Space, 
  Spin
} from 'antd';
import { 
  ArrowLeftOutlined, 
  SaveOutlined,
  TruckOutlined
} from '@ant-design/icons';
import LoadingPage from '../../common/LoadingPage';

const { Option } = Select;

const AdminOrderShipment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const showToast = useToast();
  console.log(order);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await getOrderById(id);
        setOrder(response.data);
        if (response.data.shipment) {
          form.setFieldsValue({
            carrier: response.data.shipment.carrier,
            tracking_number: response.data.shipment.trackingNumber,
            status: response.data.shipment.status
          });
        }
      } catch (error) {
        showToast(error.response?.data?.message || 'Có lỗi xảy ra khi lấy thông tin đơn hàng', 'error');
        navigate('/admin/orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, navigate, form]);

  const handleSubmit = async (values) => {
    try {
      await updateShipment(id, values);
      showToast('Cập nhật thông tin vận chuyển thành công', 'success');
      navigate(`/admin/orders/${id}`);
    } catch (error) {
      showToast(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin vận chuyển', 'error');
    }
  };

  if (loading) {
    return <LoadingPage />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card 
        title={
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate(`/admin/orders/${id}`)}
            >
              Quay lại
            </Button>
            <span>Quản lý vận chuyển</span>
          </Space>
        }
      >
        <Descriptions bordered className="mb-6">
          <Descriptions.Item label="Mã đơn hàng">
            {order.order_number}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày đặt">
            {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
          </Descriptions.Item>
          <Descriptions.Item label="Khách hàng">
            {order.user?.username}
          </Descriptions.Item>
            <Descriptions.Item label="Email">
              {order.user?.email}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              {order.user?.phone}
            </Descriptions.Item>
        </Descriptions>

        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
        >
          <Form.Item
            name="carrier"
            label="Đơn vị vận chuyển"
            rules={[{ required: true, message: 'Vui lòng nhập đơn vị vận chuyển' }]}
          >
            <Input prefix={<TruckOutlined />} />
          </Form.Item>

          <Form.Item
            name="tracking_number"
            label="Mã vận đơn"
            rules={[{ required: true, message: 'Vui lòng nhập mã vận đơn' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái vận chuyển"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái vận chuyển' }]}
          >
            <Select>
              <Option value="pending">Chờ xử lý</Option>
              <Option value="processing">Đang xử lý</Option>
              <Option value="shipped">Đang vận chuyển</Option>
              <Option value="delivered">Đã giao hàng</Option>
              <Option value="cancelled">Đã hủy</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit"
              icon={<SaveOutlined />}
            >
              Cập nhật
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AdminOrderShipment; 