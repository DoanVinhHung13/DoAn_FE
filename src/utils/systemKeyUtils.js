// src/utils/systemKeyUtils.js

/**
 * Lấy danh sách con (options) dựa vào một CodeKey cha.
 * Dùng để bind data vào Dropdown, Select, Radio...
 * @param {string} key - Mã của nhóm cần lấy (VD: 'SYSTEM_KEY.SEX_TYPE')
 * @param {Array} listSystemKey - Mảng SystemKey lấy từ Redux
 * @returns {Array} - Mảng các phần tử con
 */
export const getListComboByKey = (key, listSystemKey) => {
  if (!listSystemKey || !Array.isArray(listSystemKey)) return []

  const sortItems = (items) => items.sort((a, b) => {
    const sortA = a.sortOrder ?? a.SortOrder ?? 0
    const sortB = b.sortOrder ?? b.SortOrder ?? 0
    return sortA - sortB
  })

  // Filter chỉ lấy items đang active
  const filterActive = (items) => items.filter(item => {
    const isActive = item.isActive ?? item.IsActive
    // Nếu không có field isActive, coi như active (backward compatible)
    return isActive === undefined || isActive === true
  })

  // Tìm theo Parent CodeKey (Không phân biệt hoa thường)
  const normalizedKey = String(key).toUpperCase()
  const parent = listSystemKey.find(x => {
    const code = x.codeKey || x.CodeKey
    return code && String(code).toUpperCase() === normalizedKey
  })

  if (parent) {
    // Nếu Backend trả về dạng cây lồng nhau (có mảng children bên trong)
    if (parent.children && Array.isArray(parent.children) && parent.children.length > 0) {
      return sortItems(filterActive([...parent.children]))
    }
    // Nếu Backend trả về mảng phẳng
    const parentId = parent.id || parent.ID || parent.Id
    const children = listSystemKey.filter(x => x.parentId === parentId || x.ParentID === parentId)
    return sortItems(filterActive(children))
  }

  // Fallback: Tìm theo prefix (VD: key là "STATUS" -> tìm "STATUS_ACTIVE", "STATUS_INACTIVE")
  const prefix = key + '_'
  const items = listSystemKey.filter(x => {
    const codeKey = x.codeKey || x.CodeKey
    return codeKey?.startsWith(prefix)
  })
  
  if (items.length > 0) {
    return sortItems(filterActive(items))
  }

  return []
}

/**
 * Lấy text mô tả của một trạng thái dựa vào Value.
 * Dùng để hiển thị Label trong Table hoặc phần thông tin chi tiết.
 * @param {string} key - Mã của nhóm (VD: 'SYSTEM_KEY.STATUS')
 * @param {string|number} value - Giá trị cần map (VD: 1, 2)
 * @param {Array} listSystemKey - Mảng SystemKey lấy từ Redux
 * @returns {string} - Tên mô tả (Description)
 */
export const getSystemKeyDescription = (key, value, listSystemKey) => {
  if (value === undefined || value === null || !listSystemKey) return ""

  const options = getListComboByKey(key, listSystemKey)
  const foundOption = options.find(
    option => {
       const codeVal = option.codeValue ?? option.CodeValue
       return String(codeVal) === String(value)
    }
  )

  return foundOption?.description || foundOption?.Description || ""
}
