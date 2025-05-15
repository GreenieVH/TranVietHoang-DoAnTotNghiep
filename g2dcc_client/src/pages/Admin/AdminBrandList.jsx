import React, { useState, useEffect } from "react";
import { Table, Button, Space, Input, Modal, message, Tag } from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import BrandForm from "@/components/features/Admin/BrandForm";
import { createBrand, deleteBrand, getBrands, updateBrand } from "../../api/brand";
import { useToast } from "../../context/ToastContext";
import { useLocation, useNavigate } from "react-router-dom";

const AdminBrandList = () => {
    const showToast = useToast();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentBrand, setCurrentBrand] = useState(null);
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

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
    if (value) {
      navigate(`/admin/brands?search=${encodeURIComponent(value)}`, { replace: true });
    } else {
      navigate("/admin/brands", { replace: true });
    }
  };

  const columns = [
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
    },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      key: "is_active",
      render: (is_active) => (
        <Tag color={is_active ? "green" : "red"}>
          {is_active ? "Hoạt động" : "Không hoạt động"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  const fetchBrands = async (params = {}) => {
    setLoading(true);
    try {
      const { current, pageSize, ...filters } = params;
      const apiParams = {
        page: current || pagination.current,
        limit: pageSize || pagination.pageSize,
        ...filters,
      };

      if (searchText) {
        apiParams.search = searchText;
      }

      const response = await getBrands(apiParams);
      setBrands(response.data);
      setPagination({
        ...pagination,
        total: response.pagination?.total || response.data.length,
      });
    } catch (error) {
      console.log("Failed to fetch brands");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, [searchText]);

  const handleTableChange = (pagination, filters, sorter) => {
    setPagination(pagination);
    fetchBrands({
      current: pagination.current,
      pageSize: pagination.pageSize,
      ...filters,
      ...(sorter.field && {
        sortField: sorter.field,
        sortOrder: sorter.order,
      }),
    });
  };

  const handleAdd = () => {
    setCurrentBrand(null);
    setIsModalVisible(true);
  };

  const handleEdit = (brand) => {
    setCurrentBrand(brand);
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Are you sure you want to delete this brand?",
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          await deleteBrand(id);
          message.success("Brand deleted successfully");
          fetchBrands();
        } catch (error) {
          message.error("Failed to delete brand");
        }
      },
    });
  };

  const handleSubmit = async (values) => {
    try {
      if (currentBrand) {
        await updateBrand(currentBrand.id, values);
        showToast("Chỉnh sửa thương hiệu thành công", "success");
      } else {
        await createBrand(values);
        showToast("Thêm thương hiệu thành công", "success");
      }
      setIsModalVisible(false);
      fetchBrands();
    } catch (error) {
      message.error(error.response?.data?.message || "Operation failed");
    }
  };

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-md">
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Input
            placeholder="Tìm kiếm"
            prefix={<SearchOutlined />}
            onChange={handleSearch}
            style={{ width: 300 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Thêm mới
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={brands}
        rowKey="id"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
        onRow={(record) => {
          const isHighlighted = searchText && record.name.toLowerCase().includes(searchText.toLowerCase());
          return {
            className: isHighlighted ? "bg-yellow-400" : "",
          };
        }}
      />

      <BrandForm
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSubmit={handleSubmit}
        initialValues={currentBrand}
      />
    </div>
  );
};

export default AdminBrandList;
