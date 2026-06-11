// ─── API URL helpers ───────────────────────────────────────────────────────────
export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://ebookfarm.onrender.com/api').replace(/\/api$/, '')
export const API_URL = `${API_BASE_URL}/api`

/**
 * Lấy URL đầy đủ của avatar
 */
export const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return null
  if (avatarPath.startsWith('http')) return avatarPath
  return `${API_BASE_URL}${avatarPath}`
}

/**
 * Lấy chữ cái đầu từ tên để làm avatar placeholder
 */
export const getInitialAvatar = (name) => {
  return name ? name.charAt(0).toUpperCase() : 'U'
}

/**
 * Format số điện thoại: 0912 345 678
 */
export const formatPhone = (phone) => {
  if (!phone) return ''
  return phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3')
}

/**
 * Validate số điện thoại Việt Nam
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/
  return phoneRegex.test(phone)
}

/**
 * Format diện tích (m² → ha nếu >= 10000)
 */
export const formatArea = (area) => {
  if (!area) return '0 m²'
  if (area >= 10000) return `${(area / 10000).toFixed(2)} ha`
  return `${area.toLocaleString()} m²`
}

/**
 * Format giá tiền VND
 * @param {number} price
 * @returns {string} e.g. "1.500.000 đ"
 */
export const formatPrice = (price) => {
  if (!price && price !== 0) return ''
  return price.toLocaleString('vi-VN') + ' đ'
}

// ─── Blueprint: hasPermission ─────────────────────────────────────────────────
/**
 * Kiểm tra user có quyền xem menu/trang không dựa trên TabID.
 * @param {number[]} TabID   - Mảng số từ MenuItem (ví dụ: [1, 2])
 * @param {object[]} listTab - Mảng từ API (mỗi item có CategoryID và IsVistTab)
 * @returns {boolean}
 */
export const hasPermission = (TabID, listTab) => {
  if (!TabID || TabID.length === 0) return true // không khai báo TabID = public
  if (!listTab || listTab.length === 0) return false
  return listTab.some((item) =>
    TabID.some((tab) => tab === item.CategoryID && item.IsVistTab === true),
  )
}

// ─── Blueprint: trimData ──────────────────────────────────────────────────────
/**
 * Trim toàn bộ string trong object/array (dùng trong axios request interceptor)
 */
export const trimData = (data) => {
  if (!data) return data
  const result = Array.isArray(data) ? [] : {}
  Object.entries(data).forEach(([key, val]) => {
    if (typeof val === 'string') result[key] = val.trim()
    else if (typeof val === 'object' && val !== null) result[key] = trimData(val)
    else result[key] = val
  })
  return result
}
