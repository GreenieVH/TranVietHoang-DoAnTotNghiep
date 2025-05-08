import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, DatePicker, Table, Space } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { getOrders } from '../../../api/orders';
import { formatCurrency } from '../../../utils/format';
import { format, subDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import dayjs from '@/utils/dayjs-adapter';
import { useToast } from '../../../context/ToastContext';

const { RangePicker } = DatePicker;

const OrderStatistics = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, 'day'),
    dayjs()
  ]);
  const [statistics, setStatistics] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    deliveredOrders: 0,
    cancelledOrders: 0
  });
  const [topProducts, setTopProducts] = useState([]);
  const showToast = useToast();

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const [startDate, endDate] = dateRange;
      const response = await getOrders(1, 1000, {
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd')
      });

      // Handle new data structure
      const orders = response.data?.orders || [];
      
      // Calculate statistics
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.final_price || 0), 0);
      const deliveredOrders = orders.filter(order => order.status === 'delivered').length;
      const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;

      // Calculate top products
      const productSales = {};
      orders.forEach(order => {
        if (Array.isArray(order.items)) {
          order.items.forEach(item => {
            if (!item) return;
            
            const key = `${item.product_id}-${item.variant_id || 'default'}`;
            if (!productSales[key]) {
              productSales[key] = {
                productName: item.product_name || 'Unknown Product',
                variantName: item.variant_name || null,
                quantity: 0,
                revenue: 0
              };
            }
            productSales[key].quantity += item.quantity || 0;
            productSales[key].revenue += (item.quantity || 0) * parseFloat(item.unit_price || 0);
          });
        }
      });

      const topProductsList = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      setStatistics({
        totalOrders,
        totalRevenue,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        deliveredOrders,
        cancelledOrders
      });
      setTopProducts(topProductsList);
    } catch (error) {
      showToast(error.message || 'Có lỗi xảy ra khi lấy thống kê', 'error');
      setStatistics({
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        deliveredOrders: 0,
        cancelledOrders: 0
      });
      setTopProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, [dateRange]);

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  const topProductsColumns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Biến thể',
      dataIndex: 'variantName',
      key: 'variantName',
      render: (text) => text || 'Không có'
    },
    {
      title: 'Số lượng bán',
      dataIndex: 'quantity',
      key: 'quantity',
      sorter: (a, b) => a.quantity - b.quantity
    },
    {
      title: 'Doanh thu',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (value) => formatCurrency(value),
      sorter: (a, b) => a.revenue - b.revenue
    }
  ];

  return (
    <div className="p-6">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card>
          <Space className="mb-4">
            <RangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
              format="DD/MM/YYYY"
            />
          </Space>

          <Row gutter={16}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Tổng số đơn hàng"
                  value={statistics.totalOrders}
                  loading={loading}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Tổng doanh thu"
                  value={statistics.totalRevenue}
                  precision={0}
                  prefix="₫"
                  loading={loading}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Giá trị đơn hàng trung bình"
                  value={statistics.averageOrderValue}
                  precision={0}
                  prefix="₫"
                  loading={loading}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Tỷ lệ đơn hàng thành công"
                  value={statistics.totalOrders > 0 
                    ? (statistics.deliveredOrders / statistics.totalOrders * 100).toFixed(1)
                    : 0}
                  suffix="%"
                  loading={loading}
                />
              </Card>
            </Col>
          </Row>
        </Card>

        <Card title="Top sản phẩm bán chạy">
          <Table
            columns={topProductsColumns}
            dataSource={topProducts}
            rowKey={(record) => `${record.productName}-${record.variantName}`}
            loading={loading}
            pagination={false}
          />
        </Card>
      </Space>
    </div>
  );
};

export default OrderStatistics; 