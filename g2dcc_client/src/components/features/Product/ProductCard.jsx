import React, { useState } from "react";
import { Card, Rate, Tag, Button } from "antd";
import { ShoppingCartOutlined, HeartOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import WishlistButton from "../../common/WishlistButton";
import AddToCartButton from "../../common/AddToCartButton";

const { Meta } = Card;

const ProductCard = ({ product }) => {
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants?.[0] || null
  );
  const [isDragging, setIsDragging] = useState(false);
  const navigate = useNavigate();

  const handleMouseDown = () => {
    setIsDragging(false);
  };

  const handleMouseMove = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    if (!isDragging) {
      navigate(`/products/${product.id}`);
    }
  };

  return (
    <Card
      hoverable
      className="w-full h-full flex flex-col !p-2"
      bodyStyle={{
        padding: 0,
        flex: 1,
        display: "flex",
        flexDirection: "column",
      }}
      styles={{
        actions: {
          marginTop: "10px",
        },
      }}
      cover={
        <div 
          className="relative"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <img
            alt={product.name}
            src={product.images?.[0]?.url || "/placeholder-product.jpg"}
            className="h-48 w-full object-cover"
          />
          {product.isFeatured && (
            <div className="absolute top-0 right-0 z-10">
              <Tag color="red" className="!m-0 !rounded-none !rounded-bl-lg">
                Mới
              </Tag>
            </div>
          )}
        </div>
      }
      actions={[
        <div className="w-full px-2">
          <AddToCartButton
            productId={product.id}
            variantId={selectedVariant?.id}
            stock={selectedVariant?.stock || product.stock}
            buttonProps={{
              block: true,
              className: "!flex items-center justify-center",
              icon: <ShoppingCartOutlined />,
            }}
          />
        </div>,
        <div className="w-full px-2">
          <WishlistButton
            productId={product.id}
            buttonProps={{
              block: true,
              className: "!flex items-center justify-center",
            }}
          />
        </div>,
      ]}
    >
      <div className="flex flex-col h-full mt-2">
        <div 
          className="cursor-pointer"
          onClick={() => navigate(`/products/${product.id}`)}
        >
          <Meta
            title={
              <span className="text-base font-medium">{product.name}</span>
            }
          />
        </div>

        <div className="mt-2 !p-0 flex-grow">
          <div className="flex flex-col justify-between items-start mb-1">
            <span className="text-red-600 font-semibold text-sm">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(product.basePrice)}
            </span>
            <Rate
              disabled
              defaultValue={product.rating}
              allowHalf
              className="text-sm !mt-1"
            />
          </div>

          {product.variants?.length > 0 ? (
            <div className="flex flex-wrap gap-1 mt-2">
              {product.variants.map((variant) => (
                <Tag
                  key={variant.id}
                  color="blue"
                  className="!m-0"
                  onClick={() => setSelectedVariant(variant)}
                >
                  {variant.color}
                </Tag>
              ))}
            </div>
          ) : (
            <div className="h-6"></div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
