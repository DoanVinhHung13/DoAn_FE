import { areaToHectares } from 'src/utils/geoJsonUtils'

// ── Constants: Messages ──────────────────────────────────────────────────────

/** Thông báo khi danh sách vùng trồng rỗng */
export const EMPTY_LAND_MESSAGE = 'Ko tìm thấy dữ liệu'

/** Thông báo ranh giới bị chồng lấn */
export const MSG_LM_25 =
  'Ranh giới lô đất bị chồng lấn với lô đất đã tồn tại trong hệ thống.'

/** Thông báo xác nhận đổi trạng thái */
export const MSG_LM_26 =
  'Bạn có chắc chắn muốn thay đổi trạng thái hoạt động của lô đất này không?'

// ── Constants: Options cho Select ────────────────────────────────────────────

export const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'Active', label: 'Hoạt động' },
  { value: 'Inactive', label: 'Ngừng hoạt động' },
]

export const AREA_UNIT_OPTIONS = [
  { value: 'ha', label: 'Hecta (ha)' },
  { value: 'm2', label: 'Mét vuông (m²)' },
]

// ── API Response Normalizers ─────────────────────────────────────────────────

/**
 * Normalize response trả về từ API chi tiết (getLandPlotById, getFarms,...).
 * Xử lý các dạng: { data: { data: {...} } } hoặc { data: {...} } hoặc {...}
 *
 * @param {Object} response - Raw response từ axios/service
 * @returns {Object} Dữ liệu chi tiết đã unwrap
 */
export const normalizeApiDetail = (response) => {
  const payload = response?.data ?? response ?? {}
  return payload?.data ?? payload
}

/**
 * Normalize response trả về từ API danh sách (getLandPlots).
 * Trả về { items: [], total: number }
 *
 * @param {Object} response - Raw response từ axios/service
 * @returns {{ items: Array, total: number }}
 */
export const normalizeLandPlotResponse = (response) => {
  const data = response?.data?.data ?? response?.data ?? response
  const items = Array.isArray(data) ? data : (data?.items || [])
  const total = data?.totalItems ?? data?.totalCount ?? items.length
  return { items, total }
}

// ── Status Helpers ───────────────────────────────────────────────────────────

/** Lấy ID từ item */
export const getItemId = (item) => item?.id

/** Kiểm tra vùng trồng đang hoạt động hay không */
export const isLandPlotActive = (item) => item?.isActive !== false

/** Trả về label trạng thái */
export const getStatusLabel = (item) =>
  isLandPlotActive(item) ? 'Hoạt động' : 'Ngừng hoạt động'

// ── Display Formatters ───────────────────────────────────────────────────────

/** Hiển thị giá trị hoặc "Chưa cập nhật" nếu rỗng */
export const displayValue = (value) => value || 'Chưa cập nhật'

/** Format diện tích để hiển thị (VD: "1.5 ha" hoặc "500 m²") */
export const formatLandArea = (area, unit = 'ha') => {
  if (area == null || area === '') return 'Chưa cập nhật'
  const numeric = Number(area)
  if (Number.isNaN(numeric)) return displayValue(area)
  return unit === 'm2' ? `${numeric.toLocaleString('vi-VN')} m²` : `${numeric} ha`
}

// ── Boundary Helpers ─────────────────────────────────────────────────────────

/**
 * Đảm bảo boundaryJson luôn là string (để gửi API đúng format).
 * Nếu là object → JSON.stringify, nếu đã là string → giữ nguyên.
 */
export const ensureBoundaryString = (boundary) => {
  if (!boundary) return null
  if (typeof boundary === 'string') return boundary
  return JSON.stringify(boundary)
}

/**
 * Kiểm tra lỗi chồng lấn từ message API response hoặc exception.
 * @param {string|Error} msgOrError - Message hoặc Error object
 * @returns {boolean}
 */
export const isOverlapApiError = (msgOrError) => {
  const text = typeof msgOrError === 'string'
    ? msgOrError
    : msgOrError?.message || ''
  const lower = text.toLowerCase()
  return lower.includes('overlap') || text.includes('chồng')
}

// ── Payload Builder ──────────────────────────────────────────────────────────

/**
 * Tạo payload gửi API tạo/cập nhật vùng trồng.
 *
 * @param {Object} values   - Giá trị form (name, code, area, areaUnit,...)
 * @param {Object} polygonData - Dữ liệu polygon { geoJSON, areaM2, boundaryJson }
 * @returns {Object} Payload API
 */
export const buildLandPlotPayload = (values, polygonData) => {
  const areaM2 = polygonData?.areaM2 || 0
  const area =
    values.areaUnit === 'm2'
      ? Number((areaM2 || values.area || 0).toFixed(2))
      : Number((values.area ?? areaToHectares(areaM2)).toFixed(4))

  // Tính tọa độ trung tâm từ geoJSON
  const center = polygonData?.geoJSON || null
  let latitude = values.latitude
  let longitude = values.longitude

  if (center?.coordinates?.[0]?.length) {
    const ring = center.coordinates[0]
    // Loại bỏ điểm cuối nếu trùng điểm đầu (polygon đóng kín)
    const points =
      ring.length > 1 &&
      ring[0][0] === ring[ring.length - 1][0] &&
      ring[0][1] === ring[ring.length - 1][1]
        ? ring.slice(0, -1)
        : ring
    latitude = points.reduce((sum, p) => sum + p[1], 0) / points.length
    longitude = points.reduce((sum, p) => sum + p[0], 0) / points.length
  }

  return {
    name: values.name?.trim(),
    code: values.code?.trim(),
    area: area || 0.0001,
    areaUnit: values.areaUnit,
    address: values.address?.trim() || null,
    soilTypeId: values.soilTypeId || null,
    latitude: latitude ?? null,
    longitude: longitude ?? null,
    boundaryJson: ensureBoundaryString(polygonData?.boundaryJson),
    description: values.description?.trim() || null,
    status: values.status || 'Active',
  }
}
