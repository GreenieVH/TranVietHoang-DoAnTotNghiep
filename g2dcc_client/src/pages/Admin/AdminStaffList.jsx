import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Button,
  Space,
  Input,
  Modal,
  Form,
  message,
  Tag,
  Popconfirm,
  Select,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  FileExcelOutlined,
} from "@ant-design/icons";
import { formatDate } from "../../utils/format";
import * as XLSX from 'xlsx';
import useUsers from "../../hooks/useUsers";
import { updatedUser } from "../../api/user";

const { Option } = Select;

const AdminStaffList = () => {
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const { users, loading, error, fetchUsers } = useUsers();

  useEffect(() => {
    if (users) {
      const staffUsers = users.filter(user => user.role_name === 'staff');
      setFilteredStaff(staffUsers);
    }
  }, [users]);

  // Handle search
  const handleSearch = (value) => {
    setSearchText(value);
    if (!users) return;

    const filtered = users.filter((item) => {
      const searchValue = value.toLowerCase().trim();
      return (
        (item.username && item.username.toLowerCase().includes(searchValue)) ||
        (item.email && item.email.toLowerCase().includes(searchValue)) ||
        (item.phone && item.phone.includes(value))
      );
    });
    setFilteredStaff(filtered);
  };

  // Handle export to Excel
  const handleExportExcel = () => {
    try {
      // Prepare data for export
      const exportData = filteredStaff.map((item) => ({
        ID: item.id,
        "Họ và tên": item.username,
        Email: item.email,
        "Số điện thoại": item.phone,
        "Ngày tạo": formatDate(item.created_at),
        "Trạng thái": item.active ? "Đang hoạt động" : "Không hoạt động",
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Danh sách nhân viên");

      // Generate Excel file
      XLSX.writeFile(wb, "danh_sach_nhan_vien.xlsx");
      message.success("Xuất file Excel thành công");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      message.error("Có lỗi xảy ra khi xuất file Excel");
    }
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      if (editingStaff) {
        // Update existing staff
        await updatedUser(editingStaff.id, values);
        message.success("Cập nhật nhân viên thành công");
      } else {
        message.success("Chức năng thêm nhân viên đang phát triển");
      }
      setIsModalVisible(false);
      form.resetFields();
      fetchUsers(); // Refresh data after update
    } catch (error) {
      message.error("Có lỗi xảy ra");
    }
  };

  // Handle delete staff
  const handleDelete = async (id) => {
    try {
      await fetch(`/api/users/${id}`, {
        method: "DELETE",
      });
      message.success("Xóa nhân viên thành công");
      fetchUsers(); // Refresh data after delete
    } catch (error) {
      message.error("Có lỗi xảy ra khi xóa nhân viên");
    }
  };

  // Handle edit staff
  const handleEdit = (record) => {
    setEditingStaff(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  // Table columns
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Họ và tên",
      dataIndex: "username",
      key: "username",
      render: (text, record) => (
        <Space>
          <span>{text}</span>
          {record.active ? (
            <Tag color="green">Đang hoạt động</Tag>
          ) : (
            <Tag color="red">Không hoạt động</Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => formatDate(date),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa nhân viên này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="p-6 w-full bg-white rounded-lg shadow-md">
      <Card
        title="Danh sách nhân viên"
        extra={
          <Space>
            <Input
              placeholder="Tìm kiếm nhân viên..."
              prefix={<SearchOutlined />}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 250 }}
              allowClear
            />
            <Button
              type="primary"
              icon={<FileExcelOutlined />}
              onClick={handleExportExcel}
            >
              Xuất Excel
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingStaff(null);
                form.resetFields();
                setIsModalVisible(true);
              }}
            >
              Thêm nhân viên
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredStaff}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} nhân viên`,
          }}
        />
      </Card>

      {/* Add/Edit Staff Modal */}
      <Modal
        title={editingStaff ? "Cập nhật nhân viên" : "Thêm nhân viên mới"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="username"
            label="Họ và tên"
            rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
          >
            <Input />
          </Form.Item>

          {!editingStaff && (
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
            >
              <Input.Password />
            </Form.Item>
          )}

          <Form.Item
            name="is_active"
            label="Trạng thái"
            initialValue={true}
          >
            <Select>
              <Option value={true}>Đang hoạt động</Option>
              <Option value={false}>Không hoạt động</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingStaff ? "Cập nhật" : "Thêm mới"}
              </Button>
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  form.resetFields();
                }}
              >
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminStaffList;
