import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, DatePicker, Table, Space } from 'antd';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { getOrders } from '../../../../api/orders';
import { formatCurrency } from '../../../../utils/format';
import { useToast } from '../../../../context/ToastContext';
import dayjs from '@/utils/dayjs-adapter';

const { RangePicker } = DatePicker;

const OrderStatistics = () => {
  const { showToast } = useToast();
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
  const [dailyStats, setDailyStats] = useState([]);

  useEffect(() => {
    fetchStatistics();
  }, [dateRange]);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const [startDate, endDate] = dateRange;
      const res = await getOrders(1, 1000, {
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD')
      });

      const orders = res.data?.orders || [];
      processStatistics(orders);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      showToast(error.message || 'Có lỗi xảy ra khi lấy thống kê', 'error');
      resetStatistics();
    } finally {
      setLoading(false);
    }
  };

  const processStatistics = (orders) => {
    const delivered = orders.filter(o => o.status === 'delivered');
    const cancelled = orders.filter(o => o.status === 'cancelled');
    const revenue = delivered.reduce((sum, o) => sum + parseFloat(o.final_price || 0), 0);

    setStatistics({
      totalOrders: orders.length,
      totalRevenue: revenue,
      averageOrderValue: delivered.length ? revenue / delivered.length : 0,
      deliveredOrders: delivered.length,
      cancelledOrders: cancelled.length
    });

    setDailyStats(getDailyStats(orders));
    setTopProducts(getTopProducts(orders));
  };

  const resetStatistics = () => {
    setStatistics({
      totalOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      deliveredOrders: 0,
      cancelledOrders: 0
    });
    setDailyStats([]);
    setTopProducts([]);
  };

  const getDailyStats = (orders) => {
    const daily = {};

    orders.forEach(order => {
      const date = dayjs(order.created_at).format('YYYY-MM-DD');
      if (!daily[date]) {
        daily[date] = { date, orders: 0, revenue: 0, delivered: 0, cancelled: 0 };
      }
      daily[date].orders++;
      if (order.status === 'delivered') {
        daily[date].revenue += parseFloat(order.final_price || 0);
        daily[date].delivered++;
      }
      if (order.status === 'cancelled') daily[date].cancelled++;
    });

    return Object.values(daily).sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));
  };

  const getTopProducts = (orders) => {
    const sales = {};

    orders.forEach(order => {
      if (order.status !== 'delivered') return;
      order.items?.forEach(item => {
        const key = `${item.productId}-${item.variantId || 'default'}`;
        if (!sales[key]) {
          sales[key] = {
            productName: item.productName || 'Unknown Product',
            variantName: item.variantColor || 'Không có',
            quantity: 0,
            revenue: 0
          };
        }
        sales[key].quantity += item.quantity || 0;
        sales[key].revenue += (item.quantity || 0) * parseFloat(item.unit_price || 0);
      });
    });

    return Object.values(sales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  };

  const topProductsColumns = [
    { title: 'Sản phẩm', dataIndex: 'productName', key: 'productName' },
    { title: 'Màu sắc', dataIndex: 'variantName', key: 'variantName' },
    { title: 'Số lượng bán', dataIndex: 'quantity', key: 'quantity', sorter: (a, b) => a.quantity - b.quantity },
    { title: 'Doanh thu', dataIndex: 'revenue', key: 'revenue', render: formatCurrency, sorter: (a, b) => a.revenue - b.revenue }
  ];

  const formatDate = date => dayjs(date).format('DD/MM');

  const renderTooltip = ({ payload, label }) => {
    if (!payload?.length) return null;
    return (
      <div style={{ background: '#fff', padding: 10, border: '1px solid #ccc' }}>
        <p>{formatDate(label)}</p>
        {payload.map(entry => (
          <p key={entry.name} style={{ color: entry.color }}>
            {{
              orders: `Số đơn: ${entry.value}`,
              delivered: `Đã giao: ${entry.value}`,
              cancelled: `Đã hủy: ${entry.value}`,
              revenue: `Doanh thu: ${formatCurrency(entry.value)}`
            }[entry.name]}
          </p>
        ))}
      </div>
    );
  };

  const successRate = (statistics.deliveredOrders + statistics.cancelledOrders)
    ? ((statistics.deliveredOrders / (statistics.deliveredOrders + statistics.cancelledOrders)) * 100).toFixed(1)
    : 0;

  return (
    <div className="p-6 w-full">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card>
          <Space className="mb-4">
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              format="DD/MM/YYYY"
            />
          </Space>

          <Row gutter={16}>
            {[
              { title: 'Tổng số đơn hàng', value: statistics.totalOrders },
              { title: 'Tổng doanh thu', value: statistics.totalRevenue, prefix: '₫' },
              { title: 'Giá trị đơn hàng trung bình', value: statistics.averageOrderValue, prefix: '₫' },
              { title: 'Tỷ lệ đơn hàng thành công', value: successRate, suffix: '%' }
            ].map((stat, i) => (
              <Col span={6} key={i}>
                <Card>
                  <Statistic {...stat} loading={loading} precision={0} />
                </Card>
              </Col>
            ))}
          </Row>
        </Card>

        <Card title="Thống kê đơn hàng theo ngày">
          <div style={{ height: 400 }}>
            <ResponsiveContainer>
              <LineChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={formatDate} />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip content={renderTooltip} />
                <Legend />
                {[
                  { key: 'orders', name: 'Số đơn', color: '#8884d8', yAxis: 'left' },
                  { key: 'delivered', name: 'Đã giao', color: '#82ca9d', yAxis: 'left' },
                  { key: 'cancelled', name: 'Đã hủy', color: '#ff7300', yAxis: 'left' },
                  { key: 'revenue', name: 'Doanh thu', color: '#ffc658', yAxis: 'right' }
                ].map(({ key, name, color, yAxis }) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    name={name}
                    stroke={color}
                    yAxisId={yAxis}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Top sản phẩm bán chạy">
          <Table
            columns={topProductsColumns}
            dataSource={topProducts}
            rowKey={record => `${record.productName}-${record.variantName}`}
            loading={loading}
            pagination={false}
          />
        </Card>
      </Space>
    </div>
  );
};

export default OrderStatistics;
