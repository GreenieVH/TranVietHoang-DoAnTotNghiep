import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Select, Button, Card, Table, Space, Typography, message, InputNumber, Row, Col } from 'antd';
import { ShoppingCartOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { createOrder, addOrderItem } from '../../../api/orders';
import { useToast } from '../../../context/ToastContext';
import { formatCurrency } from '../../../utils/format';

const { Title, Text } = Typography;

const OrderForm = () => {
  const navigate = useNavigate();
  const showToast = useToast();
  const [form] = Form.useForm();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [shippingMethods, setShippingMethods] = useState([]);

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    // Load shipping methods
    // TODO: Implement API call to get shipping methods
    setShippingMethods([
      { id: 1, name: 'Giao hàng tiêu chuẩn', price: 30000 },
      { id: 2, name: 'Giao hàng nhanh', price: 50000 },
    ]);
  }, []);

  const handleQuantityChange = (index, value) => {
    const newCart = [...cart];
    newCart[index].quantity = value;
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const handleRemoveItem = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      // Create order
      const orderData = {
        ...values,
        total_amount: calculateTotal(),
        status: 'pending',
        payment_status: 'pending',
        payment_method: values.payment_method,
        shipping_address: values.shipping_address,
        billing_address: values.billing_address || values.shipping_address,
        shipping_fee: shippingMethods.find(m => m.id === values.shipping_method_id)?.price || 0,
        tax_amount: 0,
        discount_amount: 0,
        final_price: calculateTotal() + (shippingMethods.find(m => m.id === values.shipping_method_id)?.price || 0),
      };

      const { data: order } = await createOrder(orderData);

      // Add order items
      for (const item of cart) {
        await addOrderItem({
          order_id: order.id,
          product_id: item.productId,
          variant_id: item.variantId,
          quantity: item.quantity,
          unit_price: item.price,
        });
      }

      showToast('Đơn hàng đã được tạo thành công', 'success');
      localStorage.removeItem('cart');
      navigate(`/orders/${order.id}`);
    } catch (error) {
      showToast(error.response?.data?.message || 'Lỗi khi tạo đơn hàng', 'error');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => (
        <Space>
          <img src={record.productImage} alt={record.productName} style={{ width: 50, height: 50, objectFit: 'cover' }} />
          <div>
            <Text strong>{record.name}</Text>
            {record.variantColor && <Text type="secondary">Màu: {record.variantColor}</Text>}
          </div>
        </Space>
      ),
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price) => formatCurrency(price),
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity, record, index) => (
        <Space>
          <Button
            icon={<MinusOutlined />}
            onClick={() => handleQuantityChange(index, quantity - 1)}
            disabled={quantity <= 1}
          />
          <InputNumber
            min={1}
            value={quantity}
            onChange={(value) => handleQuantityChange(index, value)}
          />
          <Button
            icon={<PlusOutlined />}
            onClick={() => handleQuantityChange(index, quantity + 1)}
          />
        </Space>
      ),
    },
    {
      title: 'Tổng',
      key: 'total',
      render: (_, record) => formatCurrency(record.price * record.quantity),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, __, index) => (
        <Button danger onClick={() => handleRemoveItem(index)}>
          Xóa
        </Button>
      ),
    },
  ];

  return (
    <div className="order-form" style={{ padding: '24px' }}>
      <Title level={2}>Đặt hàng</Title>

      <Card loading={loading}>
        {cart.length > 0 ? (
          <>
            <Table
              columns={columns}
              dataSource={cart}
              rowKey="id"
              pagination={false}
            />

            <div style={{ marginTop: '24px', textAlign: 'right' }}>
              <Title level={4}>
                Tổng tiền: {formatCurrency(calculateTotal())}
              </Title>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              style={{ marginTop: '24px' }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="shipping_method_id"
                    label="Phương thức vận chuyển"
                    rules={[{ required: true, message: 'Vui lòng chọn phương thức vận chuyển' }]}
                  >
                    <Select>
                      {shippingMethods.map(method => (
                        <Select.Option key={method.id} value={method.id}>
                          {method.name} - {formatCurrency(method.price)}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="payment_method"
                    label="Phương thức thanh toán"
                    rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán' }]}
                  >
                    <Select>
                      <Select.Option value="cod">Thanh toán khi nhận hàng</Select.Option>
                      <Select.Option value="bank">Chuyển khoản ngân hàng</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="shipping_address"
                    label="Địa chỉ giao hàng"
                    rules={[{ required: true, message: 'Vui lòng nhập địa chỉ giao hàng' }]}
                  >
                    <Input.TextArea rows={3} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="billing_address"
                    label="Địa chỉ thanh toán"
                  >
                    <Input.TextArea rows={3} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    name="note"
                    label="Ghi chú"
                  >
                    <Input.TextArea rows={3} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Button type="primary" htmlType="submit" size="large" block>
                  Đặt hàng
                </Button>
              </Form.Item>
            </Form>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <ShoppingCartOutlined style={{ fontSize: '48px', color: '#ccc' }} />
            <Title level={3} style={{ marginTop: '16px' }}>
              Giỏ hàng trống
            </Title>
            <Text type="secondary">Hãy thêm sản phẩm vào giỏ hàng</Text>
          </div>
        )}
      </Card>
    </div>
  );
};

export default OrderForm; 