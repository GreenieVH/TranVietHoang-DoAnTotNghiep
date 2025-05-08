// src/pages/admin/promotions/AdminPromotionList.jsx
import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Popconfirm, message } from 'antd';
import { getAllPromotions, deletePromotion } from '@/api/promotions';
import PromotionForm from '@/components/features/Admin/PromotionForm';
const AdminPromotionList = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const res = await getAllPromotions();
      setPromotions(res.data || []);
    } catch (err) {
      message.error('Lỗi khi tải danh sách khuyến mãi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deletePromotion(id);
      message.success('Xóa thành công');
      fetchPromotions();
    } catch {
      message.error('Xóa thất bại');
    }
  };

  const columns = [
    { title: 'Mã', dataIndex: 'code', key: 'code' },
    { title: 'Tên', dataIndex: 'name', key: 'name' },
    { title: 'Loại', dataIndex: 'discount_type', key: 'discount_type' },
    { title: 'Giá trị', dataIndex: 'discount_value', key: 'discount_value' },
    { title: 'Bắt đầu', dataIndex: 'start_date', key: 'start_date' },
    { title: 'Kết thúc', dataIndex: 'end_date', key: 'end_date' },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button onClick={() => { setEditingPromotion(record); setShowForm(true); }}>Sửa</Button>
          <Popconfirm title="Xác nhận xoá?" onConfirm={() => handleDelete(record.id)}>
            <Button danger>Xoá</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className='w-full p-6 bg-white rounded-lg shadow-md'>
      <Button type="primary" onClick={() => { setEditingPromotion(null); setShowForm(true); }}>
        Thêm khuyến mãi
      </Button>
      <Table rowKey="id" columns={columns} dataSource={promotions} loading={loading} style={{ marginTop: 16 }} />
      {showForm && (
        <PromotionForm
          initialValues={editingPromotion}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            fetchPromotions();
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
};

export default AdminPromotionList;
