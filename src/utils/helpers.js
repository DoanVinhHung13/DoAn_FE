// Helper functions

// Base URL of the backend server (no trailing slash, no /api)
export const API_BASE_URL = import.meta.env.VITE_API_URL
// Full API URL with /api suffix
export const API_URL = `${API_BASE_URL}/api`

/**
 * Lấy URL đầy đủ của avatar
 * @param {string} avatarPath - Đường dẫn avatar từ database
 * @returns {string|null} - URL đầy đủ hoặc null
 */
export const getAvatarUrl = avatarPath => {
  if (!avatarPath) return null
  if (
    avatarPath.startsWith("http") ||
    avatarPath.startsWith("data:") ||
    avatarPath.startsWith("blob:")
  )
    return avatarPath
  return `${API_BASE_URL}${avatarPath}`
}

/**
 * Lấy chữ cái đầu từ tên để làm avatar placeholder
 * @param {string} name - Tên người dùng
 * @returns {string} - Chữ cái đầu viết hoa
 */
export const getInitialAvatar = name => {
  return name ? name.charAt(0).toUpperCase() : "U"
}

/**
 * Trả về giá trị hiển thị hoặc fallback nếu rỗng / falsy
 * @param {*} value
 * @param {string} fallback
 * @returns {*}
 */
export const displayValue = (value, fallback = "Chưa cập nhật") =>
  value || fallback

/**
 * Pattern họ và tên (chỉ gồm ký tự chữ cái và khoảng trắng)
 */
export const fullNamePattern = /^[\p{L}\s]+$/u

/**
 * Pattern địa chỉ (chữ cái, chữ số, khoảng trắng và các ký tự phân cách cơ bản)
 */
export const addressPattern = /^[\p{L}\p{N}\s,.\-/]+$/u

/**
 * Validate số điện thoại Việt Nam
 * @param {string} phone - Số điện thoại
 * @returns {boolean} - true nếu hợp lệ
 */
export const isValidPhone = phone => {
  if (!phone) return false
  const cleaned = String(phone).replace(/[\s\-()]/g, "")
  return /^(\+84|84|0)[0-9]{9,10}$/.test(cleaned)
}

/**
 * Validate Email
 * @param {string} email - Email
 * @returns {boolean} - true nếu hợp lệ
 */
export const isValidEmail = email => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Regex dùng để validate từ khoá tìm kiếm chung (chỉ cho phép chữ, số, khoảng trắng, và _, @, ., -)
 */
export const invalidCharsRegex = /[^\p{L}\d\s_@.-]/u

/**
 * Trim khoảng trắng thừa trong object data trước khi gửi API
 */
export const trimData = data => {
  if (typeof data !== "object" || data === null) return data
  if (Array.isArray(data)) return data.map(item => trimData(item))

  const newData = { ...data }
  const preserveWhitespace = new Set([
    "password",
    "currentPassword",
    "newPassword",
    "confirmPassword",
    "confirmNewPassword",
    "refreshToken",
    "accessToken",
    "otp",
  ])
  for (const key in newData) {
    if (preserveWhitespace.has(key)) continue
    if (typeof newData[key] === "string") {
      newData[key] = newData[key].trim()
    } else if (typeof newData[key] === "object") {
      newData[key] = trimData(newData[key])
    }
  }
  return newData
}

export const FULL_NAME_RULES = [
  { required: true, message: "Vui lòng nhập họ tên!" },
  {
    pattern:
      /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỮỰỲỴÝỶỸửữựỳỵỷỹ\s]+$/,
    message: "Họ tên không được chứa số hoặc ký tự đặc biệt!",
  },
  {
    validator: (_, value) => {
      if (!value) return Promise.resolve()
      const trimmed = value.trim()
      if (!trimmed)
        return Promise.reject(
          new Error("Họ tên không được chỉ chứa khoảng trắng."),
        )
      if (trimmed.length > 100)
        return Promise.reject(
          new Error("Họ tên không được vượt quá 100 ký tự."),
        )
      if (trimmed !== trimmed.replace(/\s+/g, " "))
        return Promise.reject(
          new Error("Họ tên không được chứa nhiều khoảng trắng liên tiếp."),
        )
      return Promise.resolve()
    },
  },
]

export const EMAIL_RULES = [
  { required: true, message: "Vui lòng nhập email!" },
  { whitespace: true, message: "Email không được chứa khoảng trắng!" },
  {
    validator: (_, value) => {
      if (!value || isValidEmail(value)) return Promise.resolve()
      return Promise.reject(new Error("Định dạng không hợp lệ"))
    },
  },
]

export const PASSWORD_RULES = [
  { required: true, message: "Vui lòng nhập mật khẩu!" },
  { whitespace: true, message: "Mật khẩu không được chứa khoảng trắng!" },
  { min: 6, message: "Mật khẩu phải từ 6 ký tự trở lên" },
]

export const PHONE_RULES = [
  {
    validator: (_, value) => {
      if (!value) return Promise.resolve()
      const trimmed = value.trim()
      if (!trimmed) return Promise.resolve()
      if (trimmed.length > 100)
        return Promise.reject(
          new Error("Số điện thoại không được vượt quá 100 ký tự."),
        )
      if (/\s/.test(trimmed))
        return Promise.reject(
          new Error("Số điện thoại không được chứa khoảng trắng."),
        )
      if (!isValidPhone(trimmed))
        return Promise.reject(new Error("Số điện thoại không hợp lệ"))
      return Promise.resolve()
    },
  },
]

export const CONTACT_REQUIRED_RULE = ({ getFieldValue }) => ({
  validator: (_, value) => {
    const hasEmail = getFieldValue("email")?.trim()
    const hasPhone = getFieldValue("phoneNumber")?.trim()
    if (value?.trim() || hasEmail || hasPhone) return Promise.resolve()
    return Promise.reject(new Error("Vui lòng nhập email hoặc số điện thoại!"))
  },
})

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
]

export const makeNameValidator = ({ label = "Tên", maxLength = 100 } = {}) => ({
  validator: (_, value) => {
    if (!value) return Promise.resolve()
    const trimmed = value.trim()
    if (!trimmed)
      return Promise.reject(
        new Error(`${label} không được chỉ chứa khoảng trắng.`),
      )
    if (trimmed.length > maxLength)
      return Promise.reject(
        new Error(`${label} không được vượt quá ${maxLength} ký tự.`),
      )
    if (trimmed !== trimmed.replace(/\s+/g, " "))
      return Promise.reject(
        new Error(`${label} không được chứa nhiều khoảng trắng liên tiếp.`),
      )
    return Promise.resolve()
  },
})

export const makeDescriptionValidator = ({ maxLength = 200 } = {}) => ({
  validator: (_, value) => {
    if (!value) return Promise.resolve()
    const trimmed = value.trim()
    if (!trimmed)
      return Promise.reject(
        new Error("Mô tả không được chỉ chứa khoảng trắng."),
      )
    if (trimmed.length > maxLength)
      return Promise.reject(
        new Error(`Mô tả không được vượt quá ${maxLength} ký tự.`),
      )
    if (trimmed !== trimmed.replace(/\s+/g, " "))
      return Promise.reject(
        new Error("Mô tả không được chứa nhiều khoảng trắng liên tiếp."),
      )
    return Promise.resolve()
  },
})

/**
 * Trích xuất danh sách mảnh đất / vùng trồng từ object nhật ký / kế hoạch
 * Hỗ trợ các thuộc tính: landPlotIds (mảng string), landPlots (mảng object), landPlotId, landPlotName, landPlotNames
 * @param {object} item - Object nhật ký / kế hoạch
 * @returns {Array<{ id: string|null, name: string }>} - Mảng các object { id, name }
 */
export const getLandPlotsFromLogbook = item => {
  if (!item) return []

  if (Array.isArray(item.landPlots) && item.landPlots.length > 0) {
    return item.landPlots.map(plot => ({
      id: plot?.id || plot?._id || plot?.landPlotId || null,
      name: plot?.name || plot?.landPlotName || plot?.title || "Vùng trồng",
    }))
  }

  const ids = Array.isArray(item.landPlotIds)
    ? item.landPlotIds
    : Array.isArray(item.landPlotId)
      ? item.landPlotId
      : item.landPlotId
        ? [item.landPlotId]
        : []

  let names = []
  if (Array.isArray(item.landPlotNames)) {
    names = item.landPlotNames
  } else if (
    typeof item.landPlotName === "string" &&
    item.landPlotName.trim()
  ) {
    names = item.landPlotName
      .split(",")
      .map(s => s.trim())
      .filter(Boolean)
  }

  if (ids.length > 0) {
    return ids.map((id, idx) => ({
      id,
      name:
        names[idx] ||
        (names.length === 1 && idx === 0
          ? names[0]
          : item.landPlotName || `Vùng trồng ${idx + 1}`),
    }))
  }

  if (names.length > 0) {
    return names.map(name => ({ id: null, name }))
  }

  return []
}

/**
 * Trả về chuỗi hiển thị tên các mảnh đất (ví dụ "Lô A, Lô B")
 */
export const getLandPlotNamesDisplay = (item, fallback = "Chưa cập nhật") => {
  const plots = getLandPlotsFromLogbook(item)
  if (!plots.length) return fallback
  return plots.map(p => p.name).join(", ")
}
