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

/**
 * Định dạng ngày tháng theo chuẩn Việt Nam
 * @param {string|Date} date - Ngày tháng cần định dạng
 * @returns {string} - Chuỗi đã được định dạng (dd/mm/yyyy HH:mm)
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}; 