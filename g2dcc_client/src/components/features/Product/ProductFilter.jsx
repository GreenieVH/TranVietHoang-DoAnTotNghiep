import React from 'react';
import { Form, Slider, Select, Checkbox, Button, Row, Col } from 'antd';
import { FilterOutlined } from '@ant-design/icons';

const { Option } = Select;

const buildCategoryTree = (categories) => {
  const categoryMap = {};
  const tree = [];

  // Tạo bản đồ id -> category
  categories.forEach(cat => {
    categoryMap[cat.id] = { ...cat, children: [] };
  });

  // Gắn children vào parent
  categories.forEach(cat => {
    if (cat.parent_id) {
      if (categoryMap[cat.parent_id]) {
        categoryMap[cat.parent_id].children.push(categoryMap[cat.id]);
      }
    } else {
      tree.push(categoryMap[cat.id]);
    }
  });

  return tree;
};

const ProductFilter = ({ 
  categories, 
  brands, 
  onFilter, 
  initialValues 
}) => {
  const [form] = Form.useForm();
  const categoryTree = buildCategoryTree(categories || []);

  React.useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        category: initialValues.category_id || initialValues.category
      });
    }
  }, [initialValues]);

  const handleReset = () => {
    form.resetFields();
    onFilter({});
  };

  const renderCategoryOptions = (items) => {
    return items.map(item => {
      if (item.children && item.children.length > 0) {
        return (
          <Select.OptGroup key={item.id} label={item.name}>
            {renderCategoryOptions(item.children)}
          </Select.OptGroup>
        );
      }
      return (
        <Option key={item.id} value={item.id}>
          {item.name}
        </Option>
      );
    });
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={onFilter}
      className="bg-white !p-4 rounded-lg shadow"
    >
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item name="search" label="Tìm kiếm">
            <input 
              type="text" 
              placeholder="Nhập tên sản phẩm..." 
              className="w-full p-2 border rounded"
            />
          </Form.Item>
        </Col>
        
        <Col span={24}>
          <Form.Item name="category" label="Danh mục">
            <Select placeholder="Chọn danh mục">
              {renderCategoryOptions(categoryTree)}
            </Select>
          </Form.Item>
        </Col>
        
        <Col span={24}>
          <Form.Item name="brand_id" label="Thương hiệu">
            <Select placeholder="Chọn thương hiệu">
              {brands?.map(brand => (
                <Option key={brand.id} value={brand.id}>
                  {brand.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        
        <Col span={24}>
          <Form.Item name="priceRange" label="Khoảng giá">
            <Slider
              range
              min={0}
              max={10000000}
              step={100000}
              tipFormatter={value => `${(value / 1000000).toFixed(1)} triệu`}
            />
          </Form.Item>
        </Col>
        
        <Col span={24}>
          <Form.Item name="inStock" valuePropName="checked">
            <Checkbox>Chỉ hiển thị sản phẩm còn hàng</Checkbox>
          </Form.Item>
        </Col>
        
        <Col span={24}>
          <div className="flex justify-between">
            <Button 
              type="default" 
              onClick={handleReset}
              className="text-gray-600"
            >
              Đặt lại
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              icon={<FilterOutlined />}
            >
              Lọc
            </Button>
          </div>
        </Col>
      </Row>
    </Form>
  );
};

export default ProductFilter;