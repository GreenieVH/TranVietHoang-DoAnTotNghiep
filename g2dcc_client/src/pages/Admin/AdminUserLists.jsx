import React, { useEffect, useState } from "react";
import { Table, Tag, Button, Space, Input, Select } from "antd";
import { useUser } from "../../context/UserContext";
import EditUserForm from "../../components/features/Admin/EditUserForm";
import { useToast } from "../../context/ToastContext";
import { TbEdit, TbSearch } from "react-icons/tb";
import { LiaUserLockSolid } from "react-icons/lia";

const { Search } = Input;
const { Option } = Select;

const AdminUserLists = () => {
  const { users, updateUser, refreshAllUsers } = useUser();
  const showToast = useToast();
  const [editingUser, setEditingUser] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("username"); // Mặc định tìm theo tên
  const [filteredUsers, setFilteredUsers] = useState([]);

  // Lọc người dùng khi searchTerm hoặc searchField thay đổi
  useEffect(() => {
    if (users) {
      const filtered = users.filter((user) => {
        const fieldValue = user[searchField]?.toString().toLowerCase();
        return fieldValue?.includes(searchTerm.toLowerCase());
      });
      setFilteredUsers(filtered);
    }
  }, [searchTerm, searchField, users]);

  const handleEdit = (user) => setEditingUser(user);

  const handleSave = async (id, newData) => {
    try {
      const resup = await updateUser(id, newData);
      showToast(resup.message);
      setEditingUser(null);
      refreshAllUsers();
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  const handleBanned = async (id, isBanned) => {
    try {
      const resup = await updateUser(id, { active: !isBanned });
      showToast(resup.message);
      refreshAllUsers();
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  const columns = [
    {
      title: "STT",
      key: "stt",
      render: (_, __, index) => {
        // Tính STT dựa trên trang hiện tại và số lượng item/trang
        return (pagination.current - 1) * pagination.pageSize + index + 1;
      },
      width: 80,
      align: "center",
    },
    {
      title: "Tên người dùng",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Vai trò",
      dataIndex: "role_name",
      key: "role_name",
      filters: [
        { text: "Admin", value: "admin" },
        { text: "Staff", value: "staff" },
        { text: "Customer", value: "customer" },
      ],
      onFilter: (value, record) => record.role_name === value,
      sorter: (a, b) => a.role_name.localeCompare(b.role_name),
    },
    {
      title: "Trạng thái",
      dataIndex: "active",
      key: "active",
      render: (active) => (
        <Tag color={active ? "green" : "red"}>
          {active ? "Hoạt động" : "Khóa"}
        </Tag>
      ),
      filters: [
        { text: "Hoạt động", value: true },
        { text: "Khóa", value: false },
      ],
      onFilter: (value, record) => record.active === value,
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<TbEdit />}
            type="primary"
            onClick={() => handleEdit(record)}
          />
          <Button
            icon={<LiaUserLockSolid />}
            type="default"
            danger={record.active}
            style={{
              backgroundColor: !record.active ? "#52c41a" : undefined,
              color: !record.active ? "white" : "black",
            }}
            onClick={() => handleBanned(record.id, record.active)}
          >
            {record.active ? "Khóa" : "Mở"}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-md">
      <div className="flex gap-4 mb-6">
        <Select
          defaultValue="username"
          style={{ width: 120, height: 40 }}
          onChange={(value) => setSearchField(value)}
        >
          <Option value="username">Tên</Option>
          <Option value="email">Email</Option>
          <Option value="role_name">Vai trò</Option>
        </Select>
        <Search
          placeholder={`Tìm theo ${
            searchField === "username"
              ? "tên"
              : searchField === "email"
              ? "email"
              : "vai trò"
          }`}
          allowClear
          enterButton={
            <Button type="primary" icon={<TbSearch />}>
              Tìm
            </Button>
          }
          size="large"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md"
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredUsers?.map((user) => ({ ...user, key: user.id }))}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20", "50"],
          showTotal: (total) => `Tổng ${total} người dùng`,
          onChange: (page, pageSize) => {
            setPagination({ current: page, pageSize });
          },
        }}
        bordered
      />
      {editingUser && (
        <EditUserForm
          user={editingUser}
          onSave={handleSave}
          onCancel={() => setEditingUser(null)}
        />
      )}
    </div>
  );
};

export default AdminUserLists;
