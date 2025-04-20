import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Image,
  Typography,
  Tag,
  Divider,
  Button,
  Space,
  message,
  Spin,
  Tabs,
  Descriptions,
} from "antd";

import { ShoppingCartOutlined, HeartOutlined } from "@ant-design/icons";
import { getProductById } from "../api/product";
import ReviewSection from "../components/features/Product/ReviewSection";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await getProductById(id);
        setProduct(data);
        if (data.variants?.length > 0) {
          setSelectedVariant(data.variants[0]);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err.message);
        message.error("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    // Implement your add to cart logic here
    message.success("Product added to cart");
  };

  const handleWishlist = () => {
    // Implement your wishlist logic here
    message.success("Added to wishlist");
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
        }}
      >
        <Text type="danger">{error || "Product not found"}</Text>
      </div>
    );
  }

  return (
    <div
      className="product-detail-page mx-auto"
      style={{ padding: "16px 32px" }}
    >
      <Row gutter={[24, 24]}>
        {/* Product Images */}
        <Col xs={24} md={12} lg={10}>
          <Card bordered={false}>
            {product.images ? (
              <Image.PreviewGroup>
                <Image
                  src={product.images[0]?.url || "/placeholder-product.jpg"}
                  alt={product.name}
                  style={{ width: "100%", borderRadius: "8px" }}
                />
                <div style={{ marginTop: "16px" }}>
                  <Row gutter={[8, 8]}>
                    {product.images.slice(0, 4).map((img, index) => (
                      <Col key={index} xs={6}>
                        <Image
                          src={img.url}
                          alt={`${product.name}-${index}`}
                          style={{ borderRadius: "4px" }}
                        />
                      </Col>
                    ))}
                  </Row>
                </div>
              </Image.PreviewGroup>
            ) : (
              <Image
                src="/placeholder-product.jpg"
                alt={product.name}
                style={{ width: "100%", borderRadius: "8px" }}
              />
            )}
          </Card>
        </Col>

        {/* Product Info */}
        <Col xs={24} md={12} lg={14}>
          <div style={{ marginBottom: "24px" }}>
            <Title level={2}>{product.name}</Title>

            <div style={{ margin: "16px 0" }}>
              <Space size="middle">
                <Text strong style={{ fontSize: "18px", color: "#ff4d4f" }}>
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(selectedVariant?.price || product.base_price)}
                </Text>
                {selectedVariant?.price !== product.base_price && (
                  <Text delete type="secondary">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(product.base_price)}
                  </Text>
                )}
              </Space>
            </div>

            <div style={{ margin: "16px 0" }}>
              <Text>Hãng sản xuất: </Text>
              <Text strong>{product.brandName || "No brand"}</Text>
            </div>

            {/* Variants Selection */}
            {product.variants?.length > 0 && (
              <div style={{ margin: "16px 0" }}>
                <Text strong style={{ display: "block", marginBottom: "8px" }}>
                  Màu:
                </Text>
                <Space size="small" wrap>
                  {product.variants.map((variant) => (
                    <Button
                      key={variant.id}
                      type={
                        selectedVariant?.id === variant.id
                          ? "primary"
                          : "default"
                      }
                      onClick={() => setSelectedVariant(variant)}
                    >
                      {variant.color}
                    </Button>
                  ))}
                </Space>
              </div>
            )}

            {/* Stock Info */}
            <div style={{ margin: "16px 0" }}>
              <Text strong>Sản phẩm còn lại: </Text>
              <Text type={product.stock > 0 ? "success" : "danger"}>
                {product.stock > 0 ? `${product.stock} sản phẩm` : "Hết hàng"}
              </Text>
            </div>

            {/* Action Buttons */}
            <Space size="large" style={{ margin: "24px 0" }}>
              <Button
                type="primary"
                size="large"
                icon={<ShoppingCartOutlined />}
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
              >
                Thêm vào giỏ hàng
              </Button>
              <Button
                size="large"
                icon={<HeartOutlined />}
                onClick={handleWishlist}
              >
                Thêm vào danh sách
              </Button>
            </Space>

            <Divider />

            {/* Short Description */}
            <Paragraph>
              {product.description || "No description available"}
            </Paragraph>
          </div>
        </Col>
      </Row>

      {/* Product Details and Specifications */}
      <Row gutter={[24, 24]} style={{ marginTop: "24px" }}>
        <Col xs={24} md={12}>
          <Card title="Chi tiết sản phẩm" bordered={false}>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Thương hiệu">
                {product.brandName || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Loại">
                {product.categoryName || "-"}
              </Descriptions.Item>
              {selectedVariant && (
                <>
                  <Descriptions.Item label="Màu">
                    {selectedVariant.color || "-"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Trọng lượng xe">
                    {selectedVariant.weight || "-"} kg
                  </Descriptions.Item>
                  <Descriptions.Item label="Kích thước">
                    {selectedVariant.dimensions || "-"} (mm)
                  </Descriptions.Item>
                  <Descriptions.Item label="Vận tốc tối đa">
                    {selectedVariant.speed || "-"} km/h
                  </Descriptions.Item>
                </>
              )}
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Thông số kỹ thuật" bordered={false}>
            {selectedVariant ? (
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Dung lượng pin">
                  {selectedVariant.batteryCapacity || "-"} Ah
                </Descriptions.Item>
                <Descriptions.Item label="Công suất động cơ">
                  {selectedVariant.motorPower || "-"} W
                </Descriptions.Item>
                <Descriptions.Item label="Phạm vi cho mỗi lần sạc">
                  {selectedVariant.rangePerCharge || "-"} Km
                </Descriptions.Item>
                <Descriptions.Item label="Thời gian sạc đầy">
                  {selectedVariant.chargingTime || "-"} giờ
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <Text>Không có thông số kỹ thuật</Text>
            )}
          </Card>
        </Col>
      </Row>
      {/* Reviews Section */}
      <Row style={{ marginTop: "36px" }}>
        <Col span={24}>
          <ReviewSection productId={product.id}/>
        </Col>
      </Row>
    </div>
  );
};

export default ProductDetailPage;
