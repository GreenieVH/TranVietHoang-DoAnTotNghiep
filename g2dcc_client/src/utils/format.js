/**
 * Định dạng số tiền theo chuẩn Việt Nam
 * @param {number} amount - Số tiền cần định dạng
 * @returns {string} - Chuỗi đã được định dạng
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '0 ₫';
  
  // Chuyển đổi số thành chuỗi và thêm dấu phân cách hàng nghìn
  const formattedAmount = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);

  return formattedAmount;
}; 