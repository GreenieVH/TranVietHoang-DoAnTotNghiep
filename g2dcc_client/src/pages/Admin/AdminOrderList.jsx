import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { formatCurrency } from '../../utils/format';
import { getOrders, updateOrderStatus } from '../../api/orders';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useToast } from '../../context/ToastContext';
import { 
  Card, 
  Table, 
  Tag, 
  Button, 
  Space, 
  Select, 
  DatePicker, 
  Form, 
  Row, 
  Col,
  Spin
} from 'antd';
import { 
  SearchOutlined, 
  EyeOutlined, 
  TruckOutlined,
  ReloadOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { RangePicker } = DatePicker;

const AdminOrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({
    status: undefined,
    dateFrom: undefined,
    dateTo: undefined
  });
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const showToast = useToast();
  const filterTimeoutRef = useRef(null);

  const fetchOrders = useCallback(async (page = 1, filterValues = filters) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: pagination.pageSize,
        status: filterValues.status,
        dateFrom: filterValues.dateFrom,
        dateTo: filterValues.dateTo
      };
      
      const response = await getOrders(page, pagination.pageSize, params);
      
      setOrders(response.data.orders);
      setPagination(prev => ({
        ...prev,
        current: page,
        total: response.data.pagination.total
      }));
    } catch (error) {
      showToast(error.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách đơn hàng', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.pageSize, showToast]);

  // Chỉ fetch khi currentPage hoặc filters thay đổi
  useEffect(() => {
    fetchOrders(pagination.current);
  }, [pagination.current, filters, fetchOrders]);

  // Lấy tham số tìm kiếm từ URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get("search");
    
    if (searchQuery) {
      form.setFieldsValue({ status: searchQuery });
      setFilters(prev => ({ ...prev, status: searchQuery }));
    }
  }, [location.search, form]);

  const handleFilterChange = useCallback((changedValues) => {
    // Clear previous timeout
    if (filterTimeoutRef.current) {
      clearTimeout(filterTimeoutRef.current);
    }

    // Set new timeout
    filterTimeoutRef.current = setTimeout(() => {
      const newFilters = {
        ...filters,
        ...changedValues
      };
      
      // Convert date range to dateFrom/dateTo
      if (changedValues.dateRange) {
        newFilters.dateFrom = changedValues.dateRange[0]?.toISOString();
        newFilters.dateTo = changedValues.dateRange[1]?.toISOString();
        delete newFilters.dateRange;
      }
      
      setFilters(newFilters);
      setPagination(prev => ({ ...prev, current: 1 }));

      // Update URL with search parameters
      const searchParams = new URLSearchParams();
      if (newFilters.status) {
        searchParams.set('search', newFilters.status);
      }
      navigate(`/admin/orders?${searchParams.toString()}`, { replace: true });
    }, 500);
  }, [filters, navigate]);

  const handleTableChange = useCallback((newPagination) => {
    setPagination(newPagination);
  }, []);

  const handleStatusChange = useCallback(async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      showToast('Cập nhật trạng thái thành công', 'success');
      fetchOrders(pagination.current);
    } catch (error) {
      showToast(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái', 'error');
    }
  }, [pagination.current, fetchOrders, showToast]);

  const getStatusTag = useCallback((status) => {
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
  }, []);

  const columns = useMemo(() => [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'order_number',
      key: 'order_number',
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: vi }),
    },
    {
      title: 'Khách hàng',
      key: 'user',
      render: (_, record) => (
        <div>
          <div>{record.user?.username}</div>
          <div className="text-gray-500">{record.user?.email}</div>
        </div>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'final_price',
      key: 'final_price',
      render: (price) => formatCurrency(price),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Select
          value={status}
          onChange={(value) => handleStatusChange(record.id, value)}
          style={{ width: 150 }}
        >
          <Option value="pending">Chờ xử lý</Option>
          <Option value="processing">Đang xử lý</Option>
          <Option value="shipped">Đang vận chuyển</Option>
          <Option value="delivered">Đã giao hàng</Option>
          <Option value="cancelled">Đã hủy</Option>
        </Select>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/admin/orders/${record.id}`)}
          >
            Chi tiết
          </Button>
          <Button
            icon={<TruckOutlined />}
            onClick={() => navigate(`/admin/orders/${record.id}/shipment`)}
          >
            Vận chuyển
          </Button>
        </Space>
      ),
    },
  ], [handleStatusChange, navigate]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (filterTimeoutRef.current) {
        clearTimeout(filterTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-md">
      <Card 
        title="Quản lý đơn hàng"
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchOrders(1)}
          >
            Làm mới
          </Button>
        }
      >
        <Form
          form={form}
          onValuesChange={handleFilterChange}
          layout="vertical"
          className="mb-6"
        >
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="status" label="Trạng thái">
                <Select allowClear placeholder="Tất cả trạng thái">
                  <Option value="pending">Chờ xử lý</Option>
                  <Option value="processing">Đang xử lý</Option>
                  <Option value="shipped">Đang vận chuyển</Option>
                  <Option value="delivered">Đã giao hàng</Option>
                  <Option value="cancelled">Đã hủy</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="dateRange" label="Khoảng thời gian">
                <RangePicker 
                  style={{ width: '100%' }} 
                  onChange={(dates) => form.setFieldsValue({ dateRange: dates })}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>

        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          onRow={(record) => {
            const isHighlighted = 
              (form.getFieldValue('status') && record.status === form.getFieldValue('status')) ||
              (form.getFieldValue('dateRange') && 
                new Date(record.created_at) >= form.getFieldValue('dateRange')[0] &&
                new Date(record.created_at) <= form.getFieldValue('dateRange')[1]);
            return {
              className: isHighlighted ? "bg-yellow-400" : "",
            };
          }}
        />
      </Card>
    </div>
  );
};

export default AdminOrderList;