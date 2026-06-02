/**
 * stringsUtils.jsx — Tiện ích xử lý chuỗi toàn app
 */

/**
 * Lọc phần nội dung nội bộ [!|...|!] khỏi message server trả về.
 * Phần bên ngoài [!|...|!] là message hiển thị cho user.
 * @param {string} message
 * @returns {string}
 */
export const getMsgClient = (message) => {
  if (!message) return ""
  if (message.indexOf("[!|") !== -1 && message.indexOf("|!]") !== -1) {
    return (message.split("[!|")[0].trim() + message.split("|!]")[1]).trim()
  }
  return message
}

/**
 * Validate email cơ bản
 * @param {string} email
 * @returns {boolean}
 */
export const validateEmail = (email) => {
  if (!email) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

/**
 * Xóa dấu tiếng Việt để tìm kiếm không dấu
 * @param {string} str
 * @returns {string}
 */
export const removeDiacritics = (str) => {
  if (!str) return ""
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
}

/**
 * Cắt ngắn chuỗi và thêm "..." nếu quá dài
 * @param {string} str
 * @param {number} maxLength
 * @returns {string}
 */
export const truncateText = (str, maxLength = 100) => {
  if (!str) return ""
  return str.length > maxLength ? str.slice(0, maxLength) + "..." : str
}

/**
 * Kiểm tra chuỗi có phải số điện thoại Việt Nam không
 * @param {string} phone
 * @returns {boolean}
 */
export const validatePhone = (phone) => {
  if (!phone) return false
  return /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/.test(phone.trim())
}
