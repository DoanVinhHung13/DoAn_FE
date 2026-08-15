import { formatAreaUnit, MEASUREMENT_UNITS } from 'src/constants/measurementUnits'

// ── Constants: Messages ──────────────────────────────────────────────────────

/** Thông báo khi danh sách vùng trồng rỗng */
export const EMPTY_LAND_MESSAGE = 'Ko tìm thấy dữ liệu'

/** Thông báo ranh giới bị chồng lấn */
export const MSG_LM_25 =
  'Ranh giới lô đất bị chồng lấn với lô đất đã tồn tại trong hệ thống.'

/** Thông báo xác nhận đổi trạng thái */
export const MSG_LM_26 =
  'Bạn có chắc chắn muốn thay đổi trạng thái hoạt động của lô đất này không?'


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

/** Kiểm tra vùng trồng đang hoạt động hay không.
 * API có thể trả về cờ isActive hoặc chỉ trả về status.
 */
export const isLandPlotActive = (item) => {
  if (typeof item?.isActive === 'boolean') return item.isActive

  const status = String(item?.status ?? item?.Status ?? '').trim().toLowerCase()
  if (['inactive', 'disabled', 'deleted', 'stopped', 'ngừng hoạt động'].includes(status)) {
    return false
  }
  if (['active', 'enabled', 'đang hoạt động', 'hoạt động'].includes(status)) {
    return true
  }

  return true
}

const LAND_PLOT_CULTIVATION_STATUS = {
  AVAILABLE: {
    label: 'Đang trống',
    badgeClass: 'bg-slate-100 text-slate-600',
  },
  PLANNED: {
    label: 'Đã lên kế hoạch',
    badgeClass: 'bg-amber-50 text-amber-700',
  },
  IN_PROGRESS: {
    label: 'Đang trồng',
    badgeClass: 'bg-sky-50 text-sky-700',
  },
}

/** Trạng thái canh tác được tính từ các nhật ký đang giữ vùng trồng. */
export const getCultivationStatus = (item) =>
  String(item?.cultivationStatus ?? item?.CultivationStatus ?? 'AVAILABLE').toUpperCase()

export const getCultivationStatusMeta = (item) => {
  const status = getCultivationStatus(item)
  return {
    status,
    ...(LAND_PLOT_CULTIVATION_STATUS[status] || {
      label: 'Chưa xác định',
      badgeClass: 'bg-slate-100 text-slate-600',
    }),
  }
}

export const isLandPlotCultivationLocked = (item) =>
  ['PLANNED', 'IN_PROGRESS'].includes(getCultivationStatus(item))

export const getCultivationLogbookName = (item) =>
  item?.cultivationLogbookName ?? item?.CultivationLogbookName

export const getCultivationCropName = (item) =>
  item?.cultivationCropName ?? item?.CultivationCropName

// ── Display Formatters ───────────────────────────────────────────────────────

/** Hiển thị giá trị hoặc "Chưa cập nhật" nếu rỗng */
export const displayValue = (value) => value || 'Chưa cập nhật'

/** Format diện tích để hiển thị (VD: "1.5 ha" hoặc "500 m²") */
export const formatLandArea = (area, unit = MEASUREMENT_UNITS.SQUARE_METER) => {
  if (area == null || area === '') return 'Chưa cập nhật'
  const raw = String(area).trim()
  const normalized = raw.includes(',')
    ? raw.replace(/\./g, '').replace(',', '.')
    : /^\d{1,3}(?:\.\d{3})+$/.test(raw)
      ? raw.replace(/\./g, '')
      : raw
  const numeric = Number(normalized)
  if (!Number.isFinite(numeric)) return displayValue(area)
  return `${numeric.toLocaleString('vi-VN')} ${formatAreaUnit(unit)}`
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
 * @param {Object} values   - Giá trị form (name, area, areaUnit,...)
 * @param {Object} polygonData - Dữ liệu polygon { geoJSON, areaM2, boundaryJson }
 * @returns {Object} Payload API
 */
export const buildLandPlotPayload = (values, polygonData) => {
  const areaM2 = polygonData?.areaM2 || 0
  // Ưu tiên giá trị user nhập tay; fallback sang areaM2 từ polygon nếu form trống
  const area =
    values.area !== undefined && values.area !== null && values.area !== ''
      ? Number(Number(values.area).toFixed(2))
      : Number((areaM2 || 0).toFixed(2))

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
    area: area,
    areaUnit: MEASUREMENT_UNITS.SQUARE_METER,
    address: values.address?.trim() || null,
    soilTypeId: values.soilTypeId || null,
    latitude: latitude ?? null,
    longitude: longitude ?? null,
    boundaryJson: ensureBoundaryString(polygonData?.boundaryJson),
    description: values.description?.trim() || null,
    status: values.status || 'Active',
  }
}
