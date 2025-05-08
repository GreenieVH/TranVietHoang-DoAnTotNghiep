import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Tag, Space, Spin, message } from 'antd';
import { ClockCircleOutlined, DollarOutlined, PercentageOutlined } from '@ant-design/icons';
import { getAllPromotions } from '@/api/promotions';
import { formatCurrency } from '@/utils/format';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const Promotions = () => {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        fetchPromotions();
    }, []);

    const fetchPromotions = async () => {
        try {
            const response = await getAllPromotions();
            setPromotions(response.data);
        } catch (error) {
            message.error('Không thể tải danh sách mã giảm giá');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyCode = (promotion) => {
        const isExpired = dayjs().isAfter(dayjs(promotion.end_date));
        if (isExpired) {
            message.error('Mã khuyến mãi đã hết hạn');
            return;
        }
        navigator.clipboard
            .writeText(promotion.code)
            .then(() => {
                message.success('Đã sao chép mã: ' + promotion.code);
            })
            .catch(() => {
                message.error('Sao chép thất bại, vui lòng thử lại');
            });
    };

    const getDiscountTypeIcon = (type) => {
        return type === 'percentage' ? <PercentageOutlined /> : <DollarOutlined />;
    };

    const getDiscountTypeColor = (type) => {
        return type === 'percentage' ? 'blue' : 'green';
    };

    const formatDate = (date) => {
        return dayjs(date).format('DD/MM/YYYY HH:mm');
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ padding: '24px' }}>
            <Title level={2} style={{ textAlign: 'center', marginBottom: '32px' }}>
                Mã Giảm Giá
            </Title>

            <Row gutter={[24, 24]}>
                {promotions.map((promotion) => {
                    const isExpired = dayjs().isAfter(dayjs(promotion.end_date));
                    return (<Col xs={24} sm={12} md={8} lg={6} key={promotion.id}>
                        <Card
                            hoverable
                            cover={
                                <img
                                    alt={promotion.name}
                                    src="https://storage.googleapis.com/ops-shopee-files-live/live/shopee-blog/2023/10/998b7f4a-1.png"
                                    style={{ height: '200px', objectFit: 'cover' }}
                                />
                            }
                        >
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Title level={4}>{promotion.name}</Title>
                                <Text type="secondary">{promotion.description}</Text>

                                <Space>
                                    <Tag color={getDiscountTypeColor(promotion.discount_type)}>
                                        {promotion.discount_type === 'percentage' ? `${promotion.discount_value}` : formatCurrency(promotion.discount_value)}{getDiscountTypeIcon(promotion.discount_type)} 
                                    </Tag>
                                    {promotion.min_order_amount > 0 && (
                                        <Tag color="orange">
                                            Đơn tối thiểu: {formatCurrency(promotion.min_order_amount)}
                                        </Tag>
                                    )}
                                </Space>

                                <Space>
                                    <ClockCircleOutlined />
                                    <Text type="secondary">
                                        {formatDate(promotion.start_date)} - {formatDate(promotion.end_date)}
                                    </Text>
                                </Space>

                                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                                    <Tag color="red" style={{ fontSize: '16px', padding: '4px 8px' }} onClick={() => handleCopyCode(promotion)}>
                                        {isExpired ? 'Đã hết hạn' : 'Mã: ' + promotion.code}
                                    </Tag>
                                </div>
                            </Space>
                        </Card>
                    </Col>)
                })}
            </Row>
        </div>
    );
};

export default Promotions;