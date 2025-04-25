import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderById, updateOrderStatus, updateShipment } from '../../../api/orders';
import { formatCurrency } from '../../../utils/format';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useToast } from '../../../context/ToastContext';
import { useUser } from '../../../context/UserContext';
import { 
  Card, 
  Table, 
  Tag, 
  Button, 
  Space, 
  Descriptions, 
  Spin,
  Modal,
  Form,
  Input,
  Select,
  message
} from 'antd';
import { 
  ArrowLeftOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  TruckOutlined
} from '@ant-design/icons';

const { Option } = Select;

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updateStatusModalVisible, setUpdateStatusModalVisible] = useState(false);
  const [updateShipmentModalVisible, setUpdateShipmentModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [shipmentForm] = Form.useForm();
  const showToast = useToast();

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await getOrderById(id);
      setOrder(response.data);
    } catch (error) {
      showToast(error.response?.data?.message || 'Có lỗi xảy ra khi lấy thông tin đơn hàng', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleUpdateStatus = async (values) => {
    try {
      await updateOrderStatus(id, values.status);
      showToast('Cập nhật trạng thái đơn hàng thành công', 'success');
      setUpdateStatusModalVisible(false);
      fetchOrder();
    } catch (error) {
      showToast(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái', 'error');
    }
  };

  const handleUpdateShipment = async (values) => {
    try {
      await updateShipment(id, values);
      showToast('Cập nhật thông tin vận chuyển thành công', 'success');
      setUpdateShipmentModalVisible(false);
      fetchOrder();
    } catch (error) {
      showToast(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin vận chuyển', 'error');
    }
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      pending: { color: 'warning', text: 'Chờ xử lý' },
      processing: { color: 'processing', text: 'Đang xử lý' },
      shipped: { color: 'purple', text: 'Đang vận chuyển' },
      delivered: { color: 'success', text: 'Đã giao hàng' },
      cancelled: { color: 'error', text: 'Đã hủy' }
    };

    return (
      <Tag color={statusConfig[status].color}>
        {statusConfig[status].text}
      </Tag>
    );
  };

  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'items',
      key: 'product',
      render: (_, record) => (
        <div className="flex items-center">
          <img 
            src={record.productImage} 
            alt={record.productName} 
            className="w-12 h-12 object-cover rounded"
          />
          <div className="ml-2">
            <div className="font-medium">{record.productName}</div>
            <div className="text-sm text-gray-500">Màu: {record.variantColor}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Đơn giá',
      dataIndex: 'items',
      key: 'unit_price',
      render: (_, record) => formatCurrency(record.unit_price),
    },
    {
      title: 'Số lượng',
      dataIndex: 'items',
      key: 'quantity',
      render: (_, record) => record.quantity,
    },
    {
      title: 'Thành tiền',
      key: 'total',
      render: (_, record) => formatCurrency(record.unit_price * record.quantity),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/orders')}
        className="mb-4"
      >
        Quay lại
      </Button>

      <Card 
        title={`Chi tiết đơn hàng #${order.order_number}`}
        extra={
          user?.role === 'admin' && (
            <Space>
              <Button 
                type="primary" 
                icon={<CheckCircleOutlined />}
                onClick={() => setUpdateStatusModalVisible(true)}
              >
                Cập nhật trạng thái
              </Button>
              <Button 
                icon={<TruckOutlined />}
                onClick={() => setUpdateShipmentModalVisible(true)}
              >
                Cập nhật vận chuyển
              </Button>
            </Space>
          )
        }
      >
        <Descriptions bordered>
          <Descriptions.Item label="Ngày đặt hàng">
            {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            {getStatusTag(order.status)}
          </Descriptions.Item>
          <Descriptions.Item label="Tổng tiền">
            {formatCurrency(order.final_price)}
          </Descriptions.Item>
          {order.shipment && (
            <>
              <Descriptions.Item label="Đơn vị vận chuyển">
                {order.shipment.carrier}
              </Descriptions.Item>
              <Descriptions.Item label="Mã vận đơn">
                {order.shipment.tracking_number}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái vận chuyển">
                {getStatusTag(order.shipment.status)}
              </Descriptions.Item>
              {order.shipment.shipped_at && (
                <Descriptions.Item label="Ngày gửi hàng">
                  {format(new Date(order.shipment.shipped_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
                </Descriptions.Item>
              )}
              {order.shipment.delivered_at && (
                <Descriptions.Item label="Ngày giao hàng">
                  {format(new Date(order.shipment.delivered_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
                </Descriptions.Item>
              )}
            </>
          )}
        </Descriptions>

        <Table
          columns={columns}
          dataSource={order.items}
          rowKey="id"
          className="mt-6"
          pagination={false}
        />
      </Card>

      {user?.role === 'admin' && (
        <>
          <Modal
            title="Cập nhật trạng thái đơn hàng"
            open={updateStatusModalVisible}
            onCancel={() => setUpdateStatusModalVisible(false)}
            footer={null}
          >
            <Form
              form={form}
              onFinish={handleUpdateStatus}
              layout="vertical"
            >
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
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
                <Button type="primary" htmlType="submit">
                  Cập nhật
                </Button>
              </Form.Item>
            </Form>
          </Modal>

          <Modal
            title="Cập nhật thông tin vận chuyển"
            open={updateShipmentModalVisible}
            onCancel={() => setUpdateShipmentModalVisible(false)}
            footer={null}
          >
            <Form
              form={shipmentForm}
              onFinish={handleUpdateShipment}
              layout="vertical"
            >
              <Form.Item
                name="carrier"
                label="Đơn vị vận chuyển"
                rules={[{ required: true, message: 'Vui lòng nhập đơn vị vận chuyển' }]}
              >
                <Input />
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
                <Button type="primary" htmlType="submit">
                  Cập nhật
                </Button>
              </Form.Item>
            </Form>
          </Modal>
        </>
      )}
    </div>
  );
};

export default OrderDetail; 