import React, { useState, useEffect } from "react";
import { Button, message } from "antd";
import { HeartOutlined, HeartFilled } from "@ant-design/icons";
import {
  addToWishlist,
  removeFromWishlist,
  checkInWishlist,
} from "@/api/wishlist";
import { useToast } from "../../context/ToastContext";

const WishlistButton = ({ productId, showText = false }) => {
  const showToast = useToast();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkWishlistStatus = async () => {
      try {
        const { data } = await checkInWishlist(productId);
        setIsInWishlist(data.inWishlist);
      } catch (error) {
        console.error("Error checking wishlist:", error);
      }
    };

    checkWishlistStatus();
  }, [productId]);

  const handleToggleWishlist = async () => {
    try {
      setLoading(true);
      if (isInWishlist) {
        await removeFromWishlist(productId);
        showToast("Đã xóa khỏi danh sách yêu thích", "success");
      } else {
        await addToWishlist(productId);
        showToast("Đã thêm vào danh sách yêu thích", "success");
      }
      setIsInWishlist(!isInWishlist);
    } catch (error) {
      showToast(
        error.response?.data?.message || "Lỗi khi thêm vào danh sách yêu thích",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      className={showText ? "!w-full" : ""}
      type="text"
      icon={
        isInWishlist ? (
          <HeartFilled style={{ color: "#ff4d4f" }} />
        ) : (
          <HeartOutlined />
        )
      }
      onClick={handleToggleWishlist}
      loading={loading}
    >
      {showText && (isInWishlist ? "Đã thích" : "Yêu thích")}
    </Button>
  );
};

export default WishlistButton;
