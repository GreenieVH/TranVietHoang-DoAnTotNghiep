import React, { useEffect, useMemo, useState } from "react";
import { Table, Input, Button, Space, Modal, Select } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useCategories } from "../../hooks/useCategorys";
import { useToast } from "../../context/ToastContext";
import CategoryForm from "../../components/features/Admin/CategoryForm"; // form dùng chung cho thêm + sửa
import { deleteCategory } from "../../api/category";
import { useLocation, useNavigate } from "react-router-dom";

const { Search } = Input;
const { Option } = Select;

const buildCategoryTree = (list) => {
  const map = {};
  const roots = [];

  list.forEach((item) => {
    map[item.id] = { ...item, children: [] };
  });

  list.forEach((item) => {
    if (item.parent_id) {
      map[item.parent_id]?.children.push(map[item.id]);
    } else {
      roots.push(map[item.id]);
    }
  });

  return roots;
};

function AdminCategoryList() {
  const { categories, loading, fetchCategories } = useCategories();
  const showToast = useToast();
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [pageSize, setPageSize] = useState(5);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Lấy tham số tìm kiếm từ URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get("search");
    
    if (searchQuery) {
      setSearchText(searchQuery);
    }
  }, [location.search]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setFilteredData(
      categories.filter((cat) =>
        cat.name.toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }, [searchText, categories]);

  const handleSearch = (value) => {
    setSearchText(value);
    if (value) {
      navigate(`/admin/category-lists?search=${encodeURIComponent(value)}`, { replace: true });
    } else {
      navigate("/admin/category-lists", { replace: true });
    }
  };

  const treeData = useMemo(
    () => buildCategoryTree(filteredData),
    [filteredData]
  );

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa danh mục này?",
      okText: "Xóa",
      cancelText: "Hủy",
      onOk: async () => {
        console.log("Đã chọn OK, đang gọi API xóa");
        try {
          await deleteCategory(id);
          showToast("Xoá danh mục thành công!", "success");
          fetchCategories(); // Tải lại danh sách
        } catch (error) {
          console.log("Có lỗi khi xóa: ", error);
          showToast(
            error.response?.data?.message || "Không thể xoá danh mục!",
            "error"
          );
        }
      },
    });
  };

  const handleSave = () => {
    setEditingCategory(null);
    setIsModalOpen(false);
    fetchCategories();
  };

  const columns = [
    {
      title: "Tên danh mục",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text) => <span className="font-semibold">{text}</span>,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      sorter: (a, b) => a.description?.localeCompare(b.description || "") || 0,
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
      sorter: (a, b) => a.slug.localeCompare(b.slug),
    },
    {
      title: "Sản phẩm",
      dataIndex: "product_count",
      key: "product_count",
      sorter: (a, b) => Number(a.product_count) - Number(b.product_count),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => {
              setEditingCategory(record);
              setIsModalOpen(true);
            }}
          >
            Sửa
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(record.id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <Search
          placeholder="Tìm kiếm danh mục..."
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: 300 }}
          allowClear
          value={searchText}
        />
        <Space>
          <Select value={pageSize} onChange={(val) => setPageSize(val)}>
            {[5, 10, 20, 50].map((num) => (
              <Option key={num} value={num}>
                {num} / trang
              </Option>
            ))}
          </Select>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingCategory(null);
              setIsModalOpen(true);
            }}
          >
            Thêm mới
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={treeData}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize }}
        expandable={{ childrenColumnName: "children" }}
        onRow={(record) => {
          const isHighlighted = searchText && record.name.toLowerCase().includes(searchText.toLowerCase());
          return {
            className: isHighlighted ? "bg-yellow-400" : "",
          };
        }}
      />

      {isModalOpen && (
        <CategoryForm
          category={editingCategory}
          onSave={handleSave}
          onCancel={() => {
            setEditingCategory(null);
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

export default AdminCategoryList;
