import React, { useState, useEffect } from "react";
import { Badge, Button } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { getCart } from "@/api/cart";

const CartBadge = () => {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const { data } = await getCart();
        const count =
          data?.items?.reduce((total, item) => total + item.quantity, 0) || 0;
        setCartCount(count);
      } catch (error) {
        console.error("Error fetching cart count:", error);
      }
    };

    fetchCartCount();
    // Có thể thêm event listener hoặc polling để cập nhật real-time
  }, []);

  return (
    <Badge count={cartCount}>
      <Button
        className="!text-thead"
        type="text"
        icon={<ShoppingCartOutlined style={{ fontSize: "20px" }} />}
        size="large"
      />
    </Badge>
  );
};

export default CartBadge;
