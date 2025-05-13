import React, { useState, useEffect, use } from "react";
import {
  Rate,
  Avatar,
  List,
  Form,
  Input,
  Button,
  message,
  Modal,
  Space,
  Divider,
  Typography,
  Tag,
  Card,
  Flex,
} from "antd";

import { UserOutlined } from "@ant-design/icons";
import { format } from "date-fns";
import { vi } from "date-fns/locale"; // Import locale tiếng Việt nếu cần
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
} from "@/api/review";
import { useToast } from "@/context/ToastContext";
import { useUser } from "@/context/UserContext";

const { TextArea } = Input;
const { Text, Title } = Typography;

const ReviewSection = ({ productId }) => {
  const showToast = useToast();
  const { user } = useUser();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0 });
  const [form] = Form.useForm();
  const [editingReview, setEditingReview] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Fetch reviews
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data } = await getProductReviews(
        productId,
        pagination.page,
        pagination.limit
      );

      setReviews(data.reviews);
      setStats(data.stats);
      setPagination((prev) => ({
        ...prev,
        total: data.stats.total_reviews || 0,
      }));
    } catch (error) {
      message.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId, pagination.page]);

  // Format date with date-fns
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy HH:mm", { locale: vi }); // Sử dụng locale tiếng Việt
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString; // Trả về nguyên bản nếu có lỗi
    }
  };

  // Check if review was edited
  const isEdited = (review) => {
    if (!review.created_at || !review.updated_at) return false;
    return (
      new Date(review.updated_at).getTime() >
      new Date(review.created_at).getTime()
    );
  };

  // Handle review submit
  const handleSubmit = async (values) => {
    try {
      const reviewData = {
        productId,
        rating: values.rating,
        title: values.title,
        comment: values.comment,
      };

      if (editingReview) {
        await updateReview(editingReview.id, reviewData);
        showToast("Bạn đã cập nhật đánh giá thành công","success");
      } else {
        await createReview(reviewData);
        showToast("Bạn đã gửi đánh giá thành công","success");
      }

      form.resetFields();
      setEditingReview(null);
      setModalVisible(false);
      fetchReviews();
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to submit review","error");
    }
  };

  // Handle edit review
  const handleEdit = (review) => {
    setEditingReview(review);
    form.setFieldsValue({
      rating: review.rating,
      title: review.title,
      comment: review.comment,
    });
    setModalVisible(true);
  };

  // Handle delete review
  const handleDelete = async (reviewId) => {
    Modal.confirm({
      title: "Xóa đánh giá",
      content: "Bạn có chắc chắn muốn xóa đánh giá này?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await deleteReview(reviewId);
          message.success("Đã xóa đánh giá thành công");
          fetchReviews();
        } catch (error) {
          message.error("Xóa đánh giá thất bại");
        }
      },
    });
  };

  // Handle pagination change
  const handlePageChange = (page, pageSize) => {
    setPagination((prev) => ({ ...prev, page, limit: pageSize }));
  };

  return (
    <div className="review-section" style={{ marginTop: "48px" }}>
      <Flex justify="space-between" align="flex-start" gap={24}>
        {/* Review Form */}
        <div className="review-form" style={{ flex: 1 }}>
          <Title level={3}>Viết đánh giá của bạn</Title>
          <Form form={form} onFinish={handleSubmit}>
            <Form.Item
              name="rating"
              rules={[{ required: true, message: "Vui lòng chọn số sao" }]}
            >
              <Rate allowHalf />
            </Form.Item>

            <Form.Item name="title">
              <Input placeholder="Tiêu đề đánh giá" />
            </Form.Item>

            <Form.Item
              name="comment"
              rules={[
                { required: true, message: "Vui lòng nhập nội dung đánh giá" },
              ]}
            >
              <TextArea rows={4} placeholder="Nội dung đánh giá..." />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                {editingReview ? "Cập nhật đánh giá" : "Gửi đánh giá"}
              </Button>
              {editingReview && (
                <Button
                  style={{ marginLeft: "8px" }}
                  onClick={() => {
                    form.resetFields();
                    setEditingReview(null);
                  }}
                >
                  Hủy
                </Button>
              )}
            </Form.Item>
          </Form>
        </div>

        {/* Review Stats */}
        <div className="review-stats" style={{ flex: 1 }}>
          <Title level={3}>Đánh giá sản phẩm</Title>
          {stats && (
            <div style={{ marginBottom: "24px" }}>
              <Space size="large">
                <div className="average-rating">
                  <Title level={2} style={{ marginBottom: 0 }}>
                    {parseFloat(stats.average).toFixed(1) || "0.0"}
                  </Title>
                  <Rate
                    disabled
                    allowHalf
                    value={parseFloat(stats.average)}
                    style={{ color: "#faad14" }}
                  />
                  <Text type="secondary">({stats.total} đánh giá)</Text>
                </div>

                <div className="rating-distribution">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const starKey = `${
                      ["five", "four", "three", "two", "one"][5 - star]
                    }_star`;
                    const starCount = parseInt(stats[starKey]) || 0;
                    const totalReviews = parseInt(stats.total) || 1;
                    const percentage = (starCount / totalReviews) * 100;

                    return (
                      <div
                        key={star}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "4px",
                        }}
                      >
                        <Rate
                          disabled
                          count={1}
                          value={1}
                          style={{ color: "#faad14" }}
                        />
                        <Text style={{ margin: "0 8px" }}>{star} sao</Text>
                        <div
                          style={{
                            width: "100px",
                            backgroundColor: "#f0f0f0",
                            borderRadius: "4px",
                          }}
                        >
                          <div
                            style={{
                              width: `${percentage}%`,
                              height: "8px",
                              backgroundColor: "#faad14",
                              borderRadius: "4px",
                            }}
                          />
                        </div>
                        <Text type="secondary" style={{ marginLeft: "8px" }}>
                          {starCount}
                        </Text>
                      </div>
                    );
                  })}
                </div>
              </Space>
            </div>
          )}
        </div>
      </Flex>

      <Divider />

      {/* Review List */}
      <div className="review-list">
        <Title level={4}>Tất cả đánh giá</Title>

        <List
          itemLayout="vertical"
          loading={loading}
          dataSource={reviews}
          locale={{ emptyText: "Chưa có đánh giá nào" }}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            onChange: handlePageChange,
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "20"],
          }}
          renderItem={(review) => (
            <Card
              size="small"
              style={{ marginBottom: "16px", borderRadius: "8px" }}
              bodyStyle={{ padding: "16px" }}
            >
              <Flex gap="middle" align="flex-start">
                <Avatar
                  size={40}
                  icon={<UserOutlined />}
                  src={review.userImage}
                />

                <Flex vertical flex={1}>
                  <Flex justify="space-between" align="center">
                    <Text strong>{review.username || "Ẩn danh"}</Text>
                    <Text type="secondary">
                      {formatDate(review.created_at)}
                      {isEdited(review) && " (Đã chỉnh sửa)"}
                    </Text>
                  </Flex>

                  <Rate
                    disabled
                    value={review.rating}
                    style={{ fontSize: "14px", margin: "8px 0" }}
                  />

                  {review.title && (
                    <Text
                      strong
                      style={{ display: "block", marginBottom: "8px" }}
                    >
                      {review.title}
                    </Text>
                  )}

                  <Text style={{ marginBottom: "8px" }}>{review.comment}</Text>

                  {review.is_buy && (
                    <Tag color="green" style={{ marginBottom: "8px" }}>
                      Đã mua sản phẩm
                    </Tag>
                  )}

                  {user && user.id === review.user_id && (
                    <Space>
                      <Button
                        type="text"
                        size="small"
                        onClick={() => handleEdit(review)}
                      >
                        Chỉnh sửa
                      </Button>
                      <Button
                        type="text"
                        size="small"
                        danger
                        onClick={() => handleDelete(review.id)}
                      >
                        Xóa
                      </Button>
                    </Space>
                  )}
                </Flex>
              </Flex>
            </Card>
          )}
        />
      </div>

      {/* Edit Modal */}
      <Modal
        title="Chỉnh sửa đánh giá"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleSubmit}>
          <Form.Item
            name="rating"
            rules={[{ required: true, message: "Vui lòng chọn số sao" }]}
          >
            <Rate allowHalf />
          </Form.Item>

          <Form.Item name="title">
            <Input placeholder="Tiêu đề đánh giá" />
          </Form.Item>

          <Form.Item
            name="comment"
            rules={[
              { required: true, message: "Vui lòng nhập nội dung đánh giá" },
            ]}
          >
            <TextArea rows={4} placeholder="Nội dung đánh giá..." />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Cập nhật
            </Button>
            <Button
              style={{ marginLeft: "8px" }}
              onClick={() => setModalVisible(false)}
            >
              Hủy
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ReviewSection;
