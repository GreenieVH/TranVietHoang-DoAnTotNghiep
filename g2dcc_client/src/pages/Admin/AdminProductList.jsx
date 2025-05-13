import React, { useState, useEffect } from "react";
import {
  Table,
  Input,
  Space,
  Button,
  Modal,
  Card,
  Select,
  Row,
  Col,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useProducts } from "../../hooks/useProducts"; // Giả sử useProducts hook trả về dữ liệu sản phẩm
import ProductForm from "../../components/features/Admin/ProductForm";
import { deleteProduct } from "../../api/product";
import { useToast } from "../../context/ToastContext";

const { Option } = Select;

const AdminProductList = () => {
  const { products, loading, error, pagination, fetchProducts } = useProducts();
  const [searchText, setSearchText] = useState("");
  const [searchField, setSearchField] = useState("all");
  const showToast = useToast();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  // Hàm tìm kiếm
  const handleSearch = (value) => {
    setSearchText(value);
    if (!products) return;

    const filtered = products.filter((product) => {
      const searchValue = value.toLowerCase().trim();
      return searchField === "all"
        ? product.name?.toLowerCase().includes(searchValue) ||
            product.categoryName?.toLowerCase().includes(searchValue) ||
            product.brandName?.toLowerCase().includes(searchValue) ||
            product.description?.toLowerCase().includes(searchValue)
        : product[searchField]?.toLowerCase().includes(searchValue);
    });

    setFilteredProducts(filtered);
  };

  // Lấy danh sách categories và brands duy nhất
  const uniqueCategories = [
    ...new Set(products?.map((p) => p.categoryName) || []),
  ];
  const uniqueBrands = [...new Set(products?.map((p) => p.brandName) || [])];

  // Cột của bảng sản phẩm
  const columns = [
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Danh mục",
      dataIndex: "categoryName",
      key: "categoryName",
      filters: uniqueCategories.map((cat) => ({ text: cat, value: cat })),
      onFilter: (value, record) => record.categoryName === value,
    },
    {
      title: "Thương hiệu",
      dataIndex: "brandName",
      key: "brandName",
      filters: uniqueBrands.map((brand) => ({ text: brand, value: brand })),
      onFilter: (value, record) => record.brandName === value,
    },
    {
      title: "Giá",
      dataIndex: "basePrice",
      key: "basePrice",
      sorter: (a, b) => a.basePrice - b.basePrice,
      render: (text) => new Intl.NumberFormat("vi-VN").format(text) + " ₫",
    },
    {
      title: "Số lượng tồn",
      dataIndex: "stock",
      key: "stock",
      sorter: (a, b) => a.stock - b.stock,
    },
    {
      title: "Đánh giá",
      dataIndex: "rating",
      key: "rating",
      sorter: (a, b) => a.rating - b.rating,
      render: (value) => {
        const num = parseFloat(value);
        return isNaN(num) ? "N/A" : num.toFixed(1);
      },
    },
    {
      title: "Thao tác",
      key: "action",
      render: (text, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditProduct(record)}
            size="small"
          >
            Sửa
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteProduct(record)}
            size="small"
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];
  // Thêm expandable config
  const expandable = {
    expandedRowRender: (record) => {
      if (!record.variants || record.variants.length === 0) {
        return <p style={{ padding: "0 16px" }}>Không có biến thể</p>;
      }

      return (
        <Table
          columns={[
            {
              title: "Màu sắc",
              dataIndex: "color",
              key: "color",
              render: (color) => (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      backgroundColor: color.toLowerCase(),
                      marginRight: 8,
                      border: "1px solid #ddd",
                    }}
                  />
                  {color}
                </div>
              ),
            },
            {
              title: "Giá",
              dataIndex: "price",
              key: "price",
              render: (text) => new Intl.NumberFormat().format(text) + " VNĐ",
            },
            { title: "Tồn kho", dataIndex: "stock", key: "stock" },
            {
              title: "Mặc định",
              dataIndex: "is_default",
              key: "is_default",
              render: (isDefault) =>
                isDefault ? <Tag color="green">Mặc định</Tag> : null,
            },
          ]}
          dataSource={record.variants}
          pagination={false}
          size="small"
          rowKey="id"
        />
      );
    },
    rowExpandable: (record) => record.variants && record.variants.length > 0,
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product?.id);
    setIsModalVisible(true); // Mở modal khi nhấn vào nút "Chỉnh sửa"
  };
  const handleDeleteProduct = (product) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa sản phẩm này?",
      okText: "Xóa",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await deleteProduct(product.id);
          showToast("Xoá sản phẩm thành công!", "success");
          fetchProducts();
        } catch (error) {
          console.log("Có lỗi khi xóa: ", error);
          showToast(error.response?.data?.message || "Không thể xoá!", "error");
        }
      },
    });
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsModalVisible(true); // Mở modal cho việc thêm sản phẩm mới
  };

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-md">
      <Card className="mb-4">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Select
              style={{ width: "100%" }}
              placeholder="Tìm kiếm theo"
              value={searchField}
              onChange={setSearchField}
            >
              <Option value="all">Tất cả</Option>
              <Option value="name">Tên sản phẩm</Option>
              <Option value="categoryName">Danh mục</Option>
              <Option value="brandName">Thương hiệu</Option>
              <Option value="description">Mô tả</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={18}>
            <Input.Search
              placeholder="Nhập từ khóa tìm kiếm"
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={18}>
            <Button type="primary" onClick={handleAddProduct}>
              Thêm sản phẩm
            </Button>
          </Col>
        </Row>
      </Card>

      <Table
        columns={columns}
        expandable={expandable}
        dataSource={filteredProducts}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng số ${total} sản phẩm`,
        }}
        loading={loading}
      />

      {/* Modal form cho sản phẩm */}
      <ProductForm
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        productId={editingProduct}
        onSuccess={() => {
          setIsModalVisible(false);
          fetchProducts();
        }}
      />
    </div>
  );
};

export default AdminProductList;
