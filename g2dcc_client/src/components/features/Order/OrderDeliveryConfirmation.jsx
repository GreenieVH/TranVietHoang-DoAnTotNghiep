import React, { useState } from 'react';
import { Button, Modal, message } from 'antd';
import { confirmOrderDelivery } from '../../../api/orders';
import { useToast } from '../../../context/ToastContext';

const OrderDeliveryConfirmation = ({ order, onSuccess }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const showToast = useToast();

  const handleConfirmDelivery = async () => {
    try {
      setLoading(true);
      await confirmOrderDelivery(order.id, 'delivered');
      showToast('Xác nhận giao hàng thành công', 'success');
      setIsModalVisible(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      showToast(error.message || 'Có lỗi xảy ra khi xác nhận giao hàng', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <>
      <Button 
        type="primary" 
        onClick={showModal}
        disabled={order.status === 'delivered'}
      >
        Xác nhận giao hàng
      </Button>

      <Modal
        title="Xác nhận giao hàng"
        open={isModalVisible}
        onOk={handleConfirmDelivery}
        onCancel={handleCancel}
        confirmLoading={loading}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <p>Bạn có chắc chắn muốn xác nhận đã giao hàng cho đơn hàng {order.order_number}?</p>
        <p>Lưu ý: Hành động này sẽ cập nhật trạng thái đơn hàng và số lượng sản phẩm trong kho.</p>
      </Modal>
    </>
  );
};

export default OrderDeliveryConfirmation; 