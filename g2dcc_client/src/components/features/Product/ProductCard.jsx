import React from 'react';
import { Card, Rate, Tag, Button } from 'antd';
import { ShoppingCartOutlined, HeartOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Meta } = Card;

const ProductCard = ({ product }) => {
  return (
    <Card
      hoverable
      className="w-full h-full flex flex-col !p-2"
      bodyStyle={{ 
        padding: 0, 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column' 
      }}
      styles={{
        actions: {
          marginTop: '10px',
          padding: '8px 0 0 0', // Giảm padding của actions
        }
      }}
      cover={
        <Link to={`/products/${product.id}`}>
          <img 
            alt={product.name} 
            src={product.images?.[0]?.url || '/placeholder-product.jpg'} 
            className="h-48 w-full object-cover"
          />
        </Link>
      }
      actions={[
        <Button 
          type="text" 
          icon={<ShoppingCartOutlined />} 
          className="!text-green-600 !p-0 !w-auto !h-auto"
        />,
        <Button 
          type="text" 
          icon={<HeartOutlined />} 
          className="!text-red-500 !p-0 !w-auto !h-auto"
        />,
      ]}
    >
      <div className="flex flex-col h-full">
        <Link to={`/products/${product.id}`}>
          <Meta
            title={<span className="text-base font-medium">{product.name}</span>}
          />
        </Link>

        <div className="mt-2 !p-0 flex-grow">
          <div className="flex flex-col justify-between items-start mb-1">
            <span className="text-red-600 font-semibold text-sm">
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
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
            <div className="flex flex-wrap gap-1 mt-1">
              {product.variants.map(variant => (
                <Tag key={variant.id} color="blue" className="!m-0">{variant.color}</Tag>
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