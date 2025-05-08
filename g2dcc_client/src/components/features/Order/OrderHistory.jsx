import React, { useState, useEffect } from 'react';
import { Table, Card, Tag, Space, DatePicker, Button } from 'antd';
import { getUserOrders } from '../../../api/orders';
import { formatCurrency } from '../../../utils/format';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useToast } from '../../../context/ToastContext';
import { useNavigate } from 'react-router-dom';

const { RangePicker } = DatePicker;

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    dateRange: undefined,
  });
  const showToast = useToast();
  const navigate = useNavigate();

  const fetchOrders = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      const response = await getUserOrders(page, pageSize, {
        status: 'delivered', // Lọc delivered phía API nếu hỗ trợ
        startDate: filters.dateRange?.[0]
          ? format(filters.dateRange[0], 'yyyy-MM-dd')
          : undefined,
        endDate: filters.dateRange?.[1]
          ? format(filters.dateRange[1], 'yyyy-MM-dd')
          : undefined,
      });

      // Handle new data structure
      const ordersData = response.data?.orders || [];
      // Lọc delivered phía client nếu API không hỗ trợ
      const filteredOrders = ordersData.filter(
        (order) => order.status === 'delivered'
      );

      setOrders(filteredOrders);
      setPagination({
        current: response.data?.pagination?.current || 1,
        pageSize: response.data?.pagination?.limit || 10,
        total: response.data?.pagination?.total || 0,
      });
    } catch (error) {
      showToast(error.message || 'Có lỗi xảy ra khi lấy lịch sử đơn hàng', 'error');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const handleTableChange = (pagination, filters, sorter) => {
    fetchOrders(pagination.current, pagination.pageSize);
  };

  const handleDateRangeChange = (dates) => {
    setFilters({ ...filters, dateRange: dates });
  };

  const getStatusTag = (status) => {
    // Chỉ hiển thị trạng thái delivered
    return <Tag color="success">Đã giao hàng</Tag>;
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
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'final_price',
      key: 'final_price',
      render: (price) => formatCurrency(parseFloat(price)),
      sorter: (a, b) => parseFloat(a.final_price) - parseFloat(b.final_price),
    },
    {
      title: 'Phương thức thanh toán',
      dataIndex: 'payment_method',
      key: 'payment_method',
      render: (method) => method || 'Thanh toán khi nhận hàng', // Giả định COD
    },
    {
      title: 'Trạng thái thanh toán',
      dataIndex: 'payment_status',
      key: 'payment_status',
      render: (status) => (
        <Tag color={status === 'paid' ? 'success' : 'warning'}>
          {status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
        </Tag>
      ),
    },
  ];

  return (
    <Card title="Lịch sử mua hàng">
      <Space className="mb-4">
        <RangePicker
          value={filters.dateRange}
          onChange={handleDateRangeChange}
          format="DD/MM/YYYY"
        />
      </Space>

      <Table
        columns={columns}
        dataSource={orders}
        rowKey="id"
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
      />
    </Card>
  );
};

export default OrderHistory;