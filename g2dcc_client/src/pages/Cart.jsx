import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  InputNumber,
  Space,
  Typography,
  Card,
  Divider,
  Badge,
  Popconfirm,
  message,
  Image,
  Checkbox,
} from "antd";
import {
  ShoppingCartOutlined,
  DeleteOutlined,
  PlusOutlined,
  MinusOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "@/api/cart";
import { useToast } from "../context/ToastContext";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const CartPage = () => {
  const navigate = useNavigate();
  const showToast = useToast();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Fetch cart data
  const fetchCart = async () => {
    try {
      setLoading(true);
      const { data } = await getCart();
      setCart(data);
      setSelectedItems([]); // Reset selection khi load lại giỏ hàng
      setSelectAll(false);
    } catch (error) {
      showToast("Lỗi khi tải giỏ hàng", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Handle quantity change
  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      await updateCartItem(itemId, newQuantity);
      showToast("Số lượng sản phẩm đã được cập nhật", "success");
      fetchCart();
    } catch (error) {
      showToast(
        error.response?.data?.message || "Lỗi khi cập nhật số lượng sản phẩm",
        "error"
      );
    }
  };

  // Handle remove item
  const handleRemoveItem = async (itemId) => {
    try {
      await removeCartItem(itemId);
      showToast("Sản phẩm đã được xóa khỏi giỏ hàng", "success");
      fetchCart();
    } catch (error) {
      showToast(
        error.response?.data?.message || "Lỗi khi xóa sản phẩm khỏi giỏ hàng",
        "error"
      );
    }
  };

  // Handle clear cart
  const handleClearCart = async () => {
    try {
      await clearCart();
      showToast("Giỏ hàng đã được xóa", "success");
      fetchCart();
    } catch (error) {
      showToast("Lỗi khi xóa giỏ hàng", "error");
    }
  };

  // Handle item selection
  const handleSelectItem = (itemId, checked) => {
    if (checked) {
      setSelectedItems([...selectedItems, itemId]);
    } else {
      setSelectedItems(selectedItems.filter((id) => id !== itemId));
    }
  };

  // Handle select all
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedItems(cart.items.map((item) => item.id));
      setSelectAll(true);
    } else {
      setSelectedItems([]);
      setSelectAll(false);
    }
  };

  // Calculate total
  const calculateTotal = () => {
    if (!cart?.items || selectedItems.length === 0) return 0;
    return cart.items
      .filter((item) => selectedItems.includes(item.id))
      .reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // Handle checkout
  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      showToast("Vui lòng chọn ít nhất một sản phẩm để đặt hàng", "warning");
      return;
    }

    // Lưu các sản phẩm đã chọn vào localStorage
    const selectedProducts = cart.items.filter(item => selectedItems.includes(item.id));
    localStorage.setItem('cart', JSON.stringify(selectedProducts));
    
    // Chuyển đến trang đặt hàng
    navigate('/orders/new');
  };

  // Columns for cart table
  const columns = [
    {
      title: (
        <Checkbox
          checked={selectAll}
          onChange={(e) => handleSelectAll(e.target.checked)}
        />
      ),
      key: "selection",
      width: 50,
      render: (_, record) => (
        <Checkbox
          checked={selectedItems.includes(record.id)}
          onChange={(e) => handleSelectItem(record.id, e.target.checked)}
        />
      ),
    },
    {
      title: "Sản phẩm",
      dataIndex: "product",
      key: "product",
      render: (_, record) => (
        <Space>
          <Image
            width={80}
            src={record.productImage || "/placeholder-product.jpg"}
            alt={record.productName}
          />
          <div>
            <Text strong>{record.productName}</Text>
            {record.variantColor && (
              <div>
                <Text type="secondary">Màu: {record.variantColor}</Text>
              </div>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price) => (
        <Text strong>
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(price)}
        </Text>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity, record) => (
        <Space>
          <Button
            icon={<MinusOutlined />}
            onClick={() => handleQuantityChange(record.id, quantity - 1)}
            disabled={quantity <= 1}
          />
          <InputNumber
            min={1}
            value={quantity}
            onChange={(value) => handleQuantityChange(record.id, value)}
          />
          <Button
            icon={<PlusOutlined />}
            onClick={() => handleQuantityChange(record.id, quantity + 1)}
          />
        </Space>
      ),
    },
    {
      title: "Tổng",
      key: "total",
      render: (_, record) => (
        <Text strong>
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(record.price * record.quantity)}
        </Text>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(record.id)}
        />
      ),
    },
  ];

  return (
    <div className="cart-page" style={{ padding: "24px" }}>
      <Title level={2}>Giỏ hàng của bạn</Title>

      <Card loading={loading}>
        {cart?.items?.length > 0 ? (
          <>
            <Table
              columns={columns}
              dataSource={cart.items}
              rowKey="id"
              pagination={false}
            />

            <Divider />

            <div style={{ textAlign: "right", marginBottom: "24px" }}>
              <Title level={4}>
                Tổng thanh toán:{" "}
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(calculateTotal())}
                <Text type="secondary" style={{ marginLeft: 8 }}>
                  ({selectedItems.length} sản phẩm được chọn)
                </Text>
              </Title>
            </div>

            <Space style={{ float: "right" }}>
              <Popconfirm
                title="Bạn có chắc muốn xóa toàn bộ giỏ hàng?"
                onConfirm={handleClearCart}
                okText="Xóa"
                cancelText="Hủy"
              >
                <Button danger icon={<DeleteOutlined />}>
                  Xóa giỏ hàng
                </Button>
              </Popconfirm>

              <Button 
                type="primary" 
                size="large"
                icon={<ArrowRightOutlined />}
                onClick={handleCheckout}
                disabled={selectedItems.length === 0}
              >
                Đặt hàng ({selectedItems.length})
              </Button>
            </Space>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <ShoppingCartOutlined style={{ fontSize: "48px", color: "#ccc" }} />
            <Title level={3} style={{ marginTop: "16px" }}>
              Giỏ hàng trống
            </Title>
            <Text type="secondary">Hãy thêm sản phẩm vào giỏ hàng</Text>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CartPage;
