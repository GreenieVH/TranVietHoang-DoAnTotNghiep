import React, { useState, useEffect } from 'react';
import { getAllOrderLogs } from '@/api/orders';
import {
  Table,
  Card,
  Space,
  Button,
  Select,
  DatePicker,
  Input,
  Modal,
  Descriptions,
  Tag,
  message,
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const statusColors = {
  pending: 'warning',
  processing: 'processing',
  shipped: 'blue',
  delivered: 'success',
  cancelled: 'error',
};

const AdminOrderLogs = () => {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    status: undefined,
    dateRange: undefined,
    search: '',
  });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await getAllOrderLogs();
      setLogs(response.data);
    } catch (error) {
      console.error('Error fetching logs:', error);
      message.error('Không thể tải dữ liệu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    // Implement search logic here
    fetchLogs();
  };

  const handleReset = () => {
    setFilters({
      status: undefined,
      dateRange: undefined,
      search: '',
    });
    fetchLogs();
  };

  const showLogDetails = (log) => {
    setSelectedLog(log);
    setIsModalVisible(true);
  };

  const filteredLogs = logs.filter(log => {
    const searchLower = filters.search.toLowerCase();
    return (
      log.order_number?.toLowerCase().includes(searchLower) ||
      log.status_name?.toLowerCase().includes(searchLower) ||
      log.created_by_name?.toLowerCase().includes(searchLower) ||
      log.note?.toLowerCase().includes(searchLower)
    );
  });

  const columns = [
    {
      title: 'Thời gian',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm:ss'),
      sorter: (a, b) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
    },
    {
      title: 'Mã đơn hàng',
      dataIndex: 'order_number',
      key: 'order_number',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Tag color={statusColors[status] || 'default'}>
          {record.status_name}
        </Tag>
      ),
      filters: [
        { text: 'Chờ xử lý', value: 'pending' },
        { text: 'Đang xử lý', value: 'processing' },
        { text: 'Đang giao hàng', value: 'shipped' },
        { text: 'Đã giao hàng', value: 'delivered' },
        { text: 'Đã hủy', value: 'cancelled' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      ellipsis: true,
    },
    {
      title: 'Người thực hiện',
      dataIndex: 'created_by_name',
      key: 'created_by_name',
      render: (text) => text || 'System',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => showLogDetails(record)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6 w-full bg-white rounded-lg shadow-md">
      <Card title="Lịch sử đơn hàng" className="mb-6">
        <Space className="mb-4" wrap>
          <Select
            placeholder="Trạng thái"
            style={{ width: 200 }}
            value={filters.status}
            onChange={(value) => handleFilterChange('status', value)}
            allowClear
          >
            <Select.Option value="pending">Chờ xử lý</Select.Option>
            <Select.Option value="processing">Đang xử lý</Select.Option>
            <Select.Option value="shipped">Đang giao hàng</Select.Option>
            <Select.Option value="delivered">Đã giao hàng</Select.Option>
            <Select.Option value="cancelled">Đã hủy</Select.Option>
          </Select>

          <RangePicker
            value={filters.dateRange}
            onChange={(dates) => handleFilterChange('dateRange', dates)}
          />

          <Input
            placeholder="Tìm kiếm..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            style={{ width: 200 }}
            prefix={<SearchOutlined />}
          />

          <Button type="primary" onClick={handleSearch}>
            Tìm kiếm
          </Button>

          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            Làm mới
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={filteredLogs}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} bản ghi`,
          }}
        />
      </Card>

      <Modal
        title="Chi tiết lịch sử đơn hàng"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={1000}
      >
        {selectedLog && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Thời gian" span={2}>
              {dayjs(selectedLog.created_at).format('DD/MM/YYYY HH:mm:ss')}
            </Descriptions.Item>
            <Descriptions.Item label="Mã đơn hàng">
              {selectedLog.order_number}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={statusColors[selectedLog.status] || 'default'}>
                {selectedLog.status_name}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Người thực hiện">
              {selectedLog.created_by_name || 'System'}
            </Descriptions.Item>
            <Descriptions.Item label="Ghi chú" span={2}>
              {selectedLog.note || '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default AdminOrderLogs; 