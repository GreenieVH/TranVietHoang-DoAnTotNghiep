import React from 'react';
import { Pagination as AntPagination } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  className = '',
  showSizeChanger = false,
  pageSize = 10
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handlePageChange = (page) => {
    if (onPageChange) {
      onPageChange(page);
    } else {
      // Nếu không có onPageChange, cập nhật URL
      const searchParams = new URLSearchParams(location.search);
      searchParams.set('page', page);
      navigate(`${location.pathname}?${searchParams.toString()}`);
    }
  };

  return (
    <div className={`flex justify-center mt-4 ${className}`}>
      <AntPagination
        current={currentPage}
        total={totalPages * pageSize}
        pageSize={pageSize}
        onChange={handlePageChange}
        showSizeChanger={showSizeChanger}
        showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} mục`}
        locale={{
          items_per_page: 'mục / trang',
          jump_to: 'Đi đến',
          jump_to_confirm: 'xác nhận',
          page: 'Trang',
          prev_page: 'Trang trước',
          next_page: 'Trang sau',
          prev_5: '5 trang trước',
          next_5: '5 trang sau',
          prev_3: '3 trang trước',
          next_3: '3 trang sau',
        }}
      />
    </div>
  );
};

export default Pagination; 