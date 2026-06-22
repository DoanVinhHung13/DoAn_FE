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

export const FULL_NAME_RULES = [
  { required: true, message: 'Vui lòng nhập họ tên!' },
  { whitespace: true, message: 'Họ tên không hợp lệ!' },
  {
    pattern: /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỮỰỲỴÝỶỸửữựỳỵỷỹ\s]+$/,
    message: 'Họ tên không được chứa số hoặc ký tự đặc biệt!'
  }
];

export const EMAIL_RULES = [
  { required: true, message: 'Vui lòng nhập email!' },
  { whitespace: true, message: 'Email không được chứa khoảng trắng!' },
  {
    validator: (_, value) => {
      if (!value || isValidEmail(value)) return Promise.resolve();
      return Promise.reject(new Error('Định dạng không hợp lệ'));
    }
  }
];

export const PASSWORD_RULES = [
  { required: true, message: 'Vui lòng nhập mật khẩu!' },
  { whitespace: true, message: 'Mật khẩu không được chứa khoảng trắng!' },
  { min: 6, message: 'Mật khẩu phải từ 6 ký tự trở lên' },
  {
    pattern: /^\S+$/,
    message: 'Mật khẩu không được chứa khoảng trắng!'
  }
];

export const PHONE_RULES = [
  {
    validator: (_, value) => {
      if (!value || isValidPhone(value)) return Promise.resolve();
      return Promise.reject(new Error('Số điện thoại không hợp lệ'));
    }
  }
];

export const LOGIN_IDENTIFIER_RULES = [
  { required: true, message: "Thông tin này là bắt buộc!" },
  { whitespace: true, message: "Không được để khoảng trắng!" },
  {
    validator: (_, value) => {
      if (!value) return Promise.resolve()
      if (isValidEmail(value) || isValidPhone(value)) {
        return Promise.resolve()
      }
      return Promise.reject(new Error("Email hoặc số điện thoại không hợp lệ!"))
    },
  },
];
