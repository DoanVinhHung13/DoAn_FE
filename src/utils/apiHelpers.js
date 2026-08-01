/**
 * API Response Normalization Utilities
 * 
 * Chuẩn hóa các format response khác nhau từ backend
 */

/**
 * Chuẩn hóa response thành format thống nhất { items, total }
 * 
 * Xử lý các format:
 * - response.data.data.items
 * - response.data.items
 * - response.data (array)
 * - response (array)
 * 
 * @param {Object|Array} response - Raw API response
 * @returns {{ items: Array, total: number }}
 */
export const normalizeListResponse = (response) => {
  const payload = response?.data ?? response ?? {}
  const data = payload?.data ?? payload

  const items = Array.isArray(data)
    ? data
    : data?.items ||
      data?.results ||
      data?.Items ||
      payload?.items ||
      payload?.results ||
      []

  const total =
    data?.totalCount ||
    data?.totalItems ||
    data?.total ||
    data?.TotalItems ||
    data?.TotalCount ||
    payload?.totalCount ||
    payload?.totalItems ||
    items.length

  return { items, total }
}

/**
 * Chuẩn hóa single item response
 * 
 * @param {Object} response - Raw API response
 * @returns {Object} Normalized item
 */
export const normalizeItemResponse = (response) => {
  const payload = response?.data ?? response ?? {}
  return payload?.data ?? payload
}

/**
 * Kiểm tra item có active không
 * Xử lý cả isActive boolean và status string
 * 
 * @param {Object} item - Item cần kiểm tra
 * @returns {boolean}
 */
export const isItemActive = (item) => {
  if (typeof item?.isActive === 'boolean') return item.isActive
  if (typeof item?.IsActive === 'boolean') return item.IsActive
  
  const status = String(item?.status || '').toLowerCase()
  return !['inactive', 'disabled', 'deleted', 'ngừng hoạt động', 'ngung hoat dong'].includes(status)
}

/**
 * Lấy label trạng thái
 * 
 * @param {Object} item - Item cần lấy status
 * @returns {string}
 */
export const getStatusLabel = (item) => 
  isItemActive(item) ? 'Hoạt động' : 'Ngừng hoạt động'
