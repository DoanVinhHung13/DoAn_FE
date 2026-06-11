// Helper functions

// Base URL of the backend server (no trailing slash, no /api)
export const API_BASE_URL = (import.meta.env.VITE_API_URL);
// Full API URL with /api suffix
export const API_URL = `${API_BASE_URL}/api`;

/**
 * Lấy URL đầy đủ của avatar
 * @param {string} avatarPath - Đường dẫn avatar từ database
 * @returns {string|null} - URL đầy đủ hoặc null
 */
export const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return null;
  if (avatarPath.startsWith('http')) return avatarPath;
  return `${API_BASE_URL}${avatarPath}`;
};

/**
 * Lấy chữ cái đầu từ tên để làm avatar placeholder
 * @param {string} name - Tên người dùng
 * @returns {string} - Chữ cái đầu viết hoa
 */
export const getInitialAvatar = (name) => {
  return name ? name.charAt(0).toUpperCase() : 'U';
};

/**
 * Format số điện thoại
 * @param {string} phone - Số điện thoại
 * @returns {string} - Số điện thoại đã format
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  // Format: 0912 345 678
  return phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
};

/**
 * Validate số điện thoại Việt Nam
 * @param {string} phone - Số điện thoại
 * @returns {boolean} - true nếu hợp lệ
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate Email
 * @param {string} email - Email
 * @returns {boolean} - true nếu hợp lệ
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Regex dùng để validate từ khoá tìm kiếm chung (chỉ cho phép chữ, số, khoảng trắng, và _, @, ., -)
 */
export const invalidCharsRegex = /[^\p{L}\d\s_@.-]/u;

/**
 * Format diện tích
 * @param {number} area - Diện tích (m²)
 * @returns {string} - Diện tích đã format
 */
export const formatArea = (area) => {
  if (!area) return '0 m²';
  if (area >= 10000) {
    return `${(area / 10000).toFixed(2)} ha`;
  }
  return `${area.toLocaleString()} m²`;
};

/**
 * Trim khoảng trắng thừa trong object data trước khi gửi API
 */
export const trimData = (data) => {
  if (typeof data !== 'object' || data === null) return data;
  if (Array.isArray(data)) return data.map(item => trimData(item));
  
  const newData = { ...data };
  for (const key in newData) {
    if (typeof newData[key] === 'string') {
      newData[key] = newData[key].trim();
    } else if (typeof newData[key] === 'object') {
      newData[key] = trimData(newData[key]);
    }
  }
  return newData;
};
