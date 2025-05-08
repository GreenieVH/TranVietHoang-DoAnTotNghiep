import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Popconfirm, Tag, Image } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useToast } from '../../context/ToastContext';
import { getAllBanners, deleteBanner } from '../../api/banners';
import BannerForm from '../../components/features/Admin/BannerForm';

const AdminBannerList = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const showToast = useToast();

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await getAllBanners();
      setBanners(response.data);
    } catch (error) {
      showToast('Lỗi khi tải danh sách banner', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleEdit = (banner) => {
    setSelectedBanner(banner);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteBanner(id);
      showToast('Xóa banner thành công', 'success');
      fetchBanners();
    } catch (error) {
      showToast('Lỗi khi xóa banner', 'error');
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedBanner(null);
  };

  const handleFormSuccess = () => {
    handleModalClose();
    fetchBanners();
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'image_url',
      key: 'image_url',
      width: 150,
      render: (imageUrl) => (
        <Image
          src={imageUrl}
          alt="Banner"
          style={{ width: 100, height: 60, objectFit: 'cover' }}
        />
      ),
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Loại',
      dataIndex: 'banner_type',
      key: 'banner_type',
      render: (type) => {
        const types = {
          main: { color: 'blue', text: 'Banner chính' },
          sub: { color: 'green', text: 'Banner phụ' },
          promotion: { color: 'orange', text: 'Khuyến mãi' },
        };
        const { color, text } = types[type] || { color: 'default', text: type };
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Thứ tự',
      dataIndex: 'display_order',
      key: 'display_order',
      width: 100,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Đang hiển thị' : 'Ẩn'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa banner này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className='w-full p-6 bg-white rounded-lg shadow-md'>
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
        >
          Thêm banner mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={banners}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={selectedBanner ? 'Chỉnh sửa banner' : 'Thêm banner mới'}
        open={modalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={800}
      >
        <BannerForm
          banner={selectedBanner}
          onSuccess={handleFormSuccess}
          onCancel={handleModalClose}
        />
      </Modal>
    </div>
  );
};

export default AdminBannerList; 