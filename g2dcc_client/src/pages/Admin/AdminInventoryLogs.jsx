import React, { useState, useEffect } from 'react';
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
  Spin,
  message,
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { getProductInventoryHistory, getVariantInventoryHistory } from '@/api/product';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const AdminInventoryLogs = () => {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    type: undefined,
    dateRange: undefined,
    search: '',
  });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await getProductInventoryHistory();
      setLogs(response);
    } catch (error) {
      message.error('Failed to fetch inventory logs');
      console.error('Error fetching logs:', error);
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
      type: undefined,
      dateRange: undefined,
      search: '',
    });
    fetchLogs();
  };

  const showLogDetails = (log) => {
    setSelectedLog(log);
    setIsModalVisible(true);
  };

  const getReferenceTypeColor = (type) => {
    const colors = {
      'ORDER': 'blue',
      'IMPORT': 'green',
      'ADJUSTMENT': 'orange',
    };
    return colors[type] || 'default';
  };

  const columns = [
    {
      title: 'Thời gian',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm:ss'),
      sorter: (a, b) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'product_name',
      key: 'product_name',
    },
    {
      title: 'Biến thể',
      dataIndex: 'variant_color',
      key: 'variant_color',
      render: (color) => color || '-',
    },
    {
      title: 'Thay đổi',
      dataIndex: 'quantity_change',
      key: 'quantity_change',
      render: (change) => (
        <span style={{ color: change > 0 ? 'green' : 'red' }}>
          {change > 0 ? `+${change}` : change}
        </span>
      ),
    },
    {
      title: 'Tồn kho',
      dataIndex: 'current_quantity',
      key: 'current_quantity',
    },
    {
      title: 'Loại',
      dataIndex: 'reference_type',
      key: 'reference_type',
      render: (type) => (
        <Tag color={getReferenceTypeColor(type)}>
          {type === 'ORDER' ? 'Đơn hàng' :
           type === 'IMPORT' ? 'Nhập hàng' :
           type === 'ADJUSTMENT' ? 'Điều chỉnh' : type}
        </Tag>
      ),
      filters: [
        { text: 'Đơn hàng', value: 'ORDER' },
        { text: 'Nhập hàng', value: 'IMPORT' },
        { text: 'Điều chỉnh', value: 'ADJUSTMENT' },
      ],
      onFilter: (value, record) => record.reference_type === value,
    },
    {
      title: 'Người thực hiện',
      dataIndex: 'created_by_name',
      key: 'created_by_name',
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
      <Card title="Lịch sử tồn kho" className="mb-6">
        <Space className="mb-4" wrap>
          <Select
            placeholder="Loại thay đổi"
            style={{ width: 200 }}
            value={filters.type}
            onChange={(value) => handleFilterChange('type', value)}
            allowClear
          >
            <Select.Option value="ORDER">Đơn hàng</Select.Option>
            <Select.Option value="IMPORT">Nhập hàng</Select.Option>
            <Select.Option value="ADJUSTMENT">Điều chỉnh</Select.Option>
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
          dataSource={logs}
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
        title="Chi tiết thay đổi tồn kho"
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
            <Descriptions.Item label="Sản phẩm">
              {selectedLog.product_name}
            </Descriptions.Item>
            <Descriptions.Item label="Biến thể">
              {selectedLog.variant_color || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Thay đổi">
              <span style={{ color: selectedLog.quantity_change > 0 ? 'green' : 'red' }}>
                {selectedLog.quantity_change > 0 ? `+${selectedLog.quantity_change}` : selectedLog.quantity_change}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Tồn kho">
              {selectedLog.current_quantity}
            </Descriptions.Item>
            <Descriptions.Item label="Loại" span={2}>
              <Tag color={getReferenceTypeColor(selectedLog.reference_type)}>
                {selectedLog.reference_type === 'ORDER' ? 'Đơn hàng' :
                 selectedLog.reference_type === 'IMPORT' ? 'Nhập hàng' :
                 selectedLog.reference_type === 'ADJUSTMENT' ? 'Điều chỉnh' : selectedLog.reference_type}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Số tham chiếu">
              {selectedLog.reference_number || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Người thực hiện">
              {selectedLog.created_by_name}
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

export default AdminInventoryLogs; 