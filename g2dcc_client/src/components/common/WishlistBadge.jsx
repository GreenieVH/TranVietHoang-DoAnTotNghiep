import React, { useState, useEffect } from "react";
import { Badge, Button } from "antd";
import { HeartOutlined } from "@ant-design/icons";
import { getWishlist } from "@/api/wishlist";

const WishlistBadge = () => {
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    const fetchWishlistCount = async () => {
      try {
        const { data } = await getWishlist(1, 1);
        setWishlistCount(data?.pagination?.total || 0);
      } catch (error) {
        console.error("Error fetching wishlist count:", error);
      }
    };

    fetchWishlistCount();
  }, []);

  return (
    <Badge count={wishlistCount}>
      <Button
        className="!text-thead"
        type="text"
        icon={<HeartOutlined style={{ fontSize: "20px" }} />}
        size="large"
      />
    </Badge>
  );
};

export default WishlistBadge;
