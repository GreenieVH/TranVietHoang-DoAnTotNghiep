import React, { useState, useEffect } from "react";
import {
  Card,
  List,
  Button,
  Space,
  Typography,
  Image,
  message,
  Pagination,
  Empty,
} from "antd";
import { HeartOutlined, HeartFilled, DeleteOutlined } from "@ant-design/icons";
import { getWishlist, removeFromWishlist } from "@/api/wishlist";
import { Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";

const { Title, Text } = Typography;

const WishlistPage = () => {
  const showToast = useToast();
  const [wishlist, setWishlist] = useState({ items: [], pagination: {} });
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchWishlist = async (page = 1) => {
    try {
      setLoading(true);
      const { data } = await getWishlist(page);
      setWishlist(data);
    } catch (error) {
      showToast("Lỗi khi tải danh sách yêu thích", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist(currentPage);
  }, [currentPage]);

  const handleRemove = async (productId) => {
    try {
      await removeFromWishlist(productId);
      showToast("Đã xóa sản phẩm khỏi danh sách yêu thích", "success");
      fetchWishlist(currentPage);
    } catch (error) {
      showToast("Lỗi khi xóa sản phẩm khỏi danh sách yêu thích", "error");
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="wishlist-page min-h-screen" style={{ padding: "24px" }}>
      <Title level={2}>Danh sách yêu thích</Title>

      <Card loading={loading}>
        {wishlist.items?.length > 0 ? (
          <>
            <List
              itemLayout="vertical"
              dataSource={wishlist.items}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemove(item.productId)}
                    >
                      Xóa
                    </Button>,
                    <Button type="primary">
                      <Link to={`/products/${item.productId}`}>
                        Xem chi tiết
                      </Link>
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Image
                        width={120}
                        src={item.imageUrl || "/placeholder-product.jpg"}
                        alt={item.name}
                      />
                    }
                    title={
                      <Link to={`/products/${item.productId}`}>
                        {item.name}
                      </Link>
                    }
                    description={
                      <Space direction="vertical">
                        <Text>{item.description}</Text>
                        <Text strong>
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(item.basePrice)}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />

            <div style={{ textAlign: "center", marginTop: "16px" }}>
              <Pagination
                current={currentPage}
                total={wishlist.pagination?.total || 0}
                pageSize={wishlist.pagination?.limit || 10}
                onChange={handlePageChange}
                showSizeChanger={false}
              />
            </div>
          </>
        ) : (
          <Empty
            image={
              <HeartOutlined style={{ fontSize: "48px", color: "#ff4d4f" }} />
            }
            description="Danh sách yêu thích của bạn đang trống"
          >
            <Button type="primary">
              <Link to="/products">Thêm ngay</Link>
            </Button>
          </Empty>
        )}
      </Card>
    </div>
  );
};

export default WishlistPage;
