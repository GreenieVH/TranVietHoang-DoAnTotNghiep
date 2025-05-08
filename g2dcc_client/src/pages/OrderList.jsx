import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/format';
import { getUserOrders } from '../api/orders';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useToast } from '../context/ToastContext';
import { Card, Table, Tag, Button, Space, Spin } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import Pagination from '../components/common/Pagination';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const showToast = useToast();

  const fetchOrders = async (page) => {
    try {
      setLoading(true);
      const response = await getUserOrders(page, 10);
      const ordersData = response.data?.orders || [];
      // Lọc các đơn hàng không phải delivered
      const filteredOrders = ordersData.filter(
        (order) => order.status !== 'delivered'
      );
      setOrders(filteredOrders);
      setTotalPages(response.data?.pagination?.pages || 1);
    } catch (error) {
      showToast(
        error.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách đơn hàng',
        'error'
      );
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      pending: { color: 'warning', text: 'Chờ xử lý' },
      processing: { color: 'processing', text: 'Đang xử lý' },
      shipped: { color: 'purple', text: 'Đang vận chuyển' },
      cancelled: { color: 'error', text: 'Đã hủy' },
    };
    return (
      <Tag color={statusConfig[status]?.color || 'default'}>
        {statusConfig[status]?.text || status}
      </Tag>
    );
  };

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'order_number',
      key: 'order_number',
      render: (text, record) => (
        <Button type="link" onClick={() => navigate(`/orders/${record.id}`)}>
          {text}
        </Button>
      ),
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => format(parseISO(date), 'dd/MM/yyyy HH:mm', { locale: vi }),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
      defaultSortOrder: 'descend', // Mặc định sắp xếp giảm dần (mới nhất trước)
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'final_price',
      key: 'final_price',
      render: (price) => formatCurrency(parseFloat(price)),
      sorter: (a, b) => parseFloat(a.final_price) - parseFloat(b.final_price),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Phương thức thanh toán',
      dataIndex: 'payment_method',
      key: 'payment_method',
      render: (method) => method || 'Thanh toán khi nhận hàng', // Giả định COD
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/orders/${record.id}`)}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  return (
      <Card title="Danh sách đơn hàng đang xử lý">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Bạn chưa có đơn hàng đang xử lý nào</p>
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              dataSource={orders}
              rowKey="id"
              pagination={false} // Tắt pagination mặc định của Table để dùng Pagination component
              loading={loading}
            />
            <div className="mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        )}
      </Card>
  );
};

export default OrderList;