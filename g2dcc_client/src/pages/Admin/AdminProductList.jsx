import React, { useState, useEffect } from "react";
import { Table, Input, Space, Button, Modal } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useProducts } from "../../hooks/useProducts"; // Giả sử useProducts hook trả về dữ liệu sản phẩm
import ProductForm from "../../components/features/Admin/ProductForm";
import { deleteProduct } from "../../api/product";
import { useToast } from "../../context/ToastContext";

const AdminProductList = () => {
  const { products, loading, error, pagination, fetchProducts } = useProducts();
  const [searchText, setSearchText] = useState("");
  const showToast = useToast();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  // Hàm tìm kiếm cột
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          autoFocus
          placeholder={`Tìm kiếm ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => confirm()}
          style={{ width: 188, marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => confirm()}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Tìm kiếm
          </Button>
          <Button onClick={clearFilters} size="small" style={{ width: 90 }}>
            Làm mới
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value, record) => {
      return record[dataIndex]
        .toString()
        .toLowerCase()
        .includes(value.toLowerCase());
    },
  });

  // Cột của bảng sản phẩm
  const columns = [
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      ...getColumnSearchProps("name"),
    },
    {
      title: "Danh mục",
      dataIndex: "categoryName",
      key: "categoryName",
    },
    {
      title: "Thương hiệu",
      dataIndex: "brandName",
      key: "brandName",
    },
    {
      title: "Giá",
      dataIndex: "basePrice",
      key: "basePrice",
      sorter: (a, b) => a.basePrice - b.basePrice,
      render: (text) => new Intl.NumberFormat().format(text) + " VNĐ",
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
        return isNaN(num) ? 'N/A' : num.toFixed(1);
      }
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
      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Tìm kiếm sản phẩm"
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: "300px" }}
        />
        <Button type="primary" onClick={handleAddProduct}>
          Thêm sản phẩm
        </Button>
      </Space>

      <Table
        columns={columns}
        expandable={expandable}
        dataSource={filteredProducts}
        rowKey="id"
        pagination={{ pageSize: 10 }}
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
