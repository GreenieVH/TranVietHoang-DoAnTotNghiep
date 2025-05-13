import React from 'react';
import { Breadcrumb } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';

const ProductBreadcrumb = ({ categories = [], currentCategoryId, productName }) => {
  const location = useLocation();

  const getCategoryPath = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return [];

    const path = [category];
    let currentCategory = category;

    while (currentCategory.parent_id) {
      const parentCategory = categories.find(cat => cat.id === currentCategory.parent_id);
      if (parentCategory) {
        path.unshift(parentCategory);
        currentCategory = parentCategory;
      } else {
        break;
      }
    }

    return path;
  };

  const renderBreadcrumb = () => {
    const items = [
      {
        title: <Link to="/"><HomeOutlined /></Link>,
      },
      {
        title: <Link to="/products">Sản phẩm</Link>,
      }
    ];

    // Thêm category path nếu có
    if (currentCategoryId) {
      const categoryPath = getCategoryPath(currentCategoryId);
      categoryPath.forEach((category, index) => {
        items.push({
          title: index === categoryPath.length - 1 && !productName ? 
            category.name : 
            <Link to="/products" state={{ filterParams: { category_id: category.id, category_name: category.name } }}>
              {category.name}
            </Link>
        });
      });
    }

    // Thêm tên sản phẩm nếu đang ở trang chi tiết
    if (productName) {
      items.push({
        title: productName
      });
    }

    return <Breadcrumb items={items} />;
  };

  return (
    <div className="mb-6">
      {renderBreadcrumb()}
    </div>
  );
};

export default ProductBreadcrumb; 