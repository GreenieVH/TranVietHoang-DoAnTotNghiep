import React, { useState } from "react";
import { Button, InputNumber, Space, message } from "antd";
import {ShoppingCartOutlined, PlusOutlined } from "@ant-design/icons";
import { addToCart } from "@/api/cart";
import { useToast } from "../../context/ToastContext";

const AddToCartButton = ({ productId, variantId, stock, compact = true }) => {
  const showToast = useToast();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async () => {
    if (quantity > stock) {
      showToast("Số lượng vượt quá trong kho",'error');
      return;
    }

    try {
      setLoading(true);
      await addToCart(productId, variantId, quantity);
      showToast("Đã thêm vào giỏ hàng",'success');
    } catch (error) {
      showToast(
        error.response?.data?.message || "Thêm vào giỏ hàng thất bại",'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return compact ? (
    <Button
      type="text"
      icon={<ShoppingCartOutlined />}
      onClick={handleAddToCart}
      loading={loading}
    />
  ) : (
    <Space.Compact>
      <InputNumber
        min={1}
        max={stock}
        size="large"
        value={quantity}
        onChange={setQuantity}
        style={{ width: "60px" }}
      />
      <Button
        type="primary"
        size="large"
        icon={<PlusOutlined />}
        onClick={handleAddToCart}
        loading={loading}
      >
        Thêm vào giỏ
      </Button>
    </Space.Compact>
  );
};

export default AddToCartButton;
