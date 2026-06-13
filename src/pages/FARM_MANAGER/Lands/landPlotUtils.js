import { areaToHectares, parseBoundaryJson } from 'src/utils/geoJsonUtils'

export const EMPTY_LAND_MESSAGE = 'Ko tìm thấy dữ liệu'

export const MSG_LM_26 =
  'Bạn có chắc chắn muốn thay đổi trạng thái hoạt động của lô đất này không?'

export const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'Active', label: 'Hoạt động' },
  { value: 'Inactive', label: 'Ngừng hoạt động' },
]

export const OWNERSHIP_OPTIONS = [
  { value: 'Owned', label: 'Sở hữu' },
  { value: 'Leased', label: 'Thuê' },
  { value: 'Cooperative', label: 'Hợp tác xã' },
  { value: 'Other', label: 'Khác' },
]

export const AREA_UNIT_OPTIONS = [
  { value: 'ha', label: 'Hecta (ha)' },
  { value: 'm2', label: 'Mét vuông (m²)' },
]

export const MSG_LM_25 =
  'Ranh giới lô đất bị chồng lấn với lô đất đã tồn tại trong hệ thống.'

export const getItemId = (item) => item?.id || item?._id || item?.landPlotId

export const displayValue = (value) => value || 'Chưa cập nhật'

export const normalizeLandPlotResponse = (response) => {
  const payload = response?.data ?? response ?? {}
  const data = payload?.data ?? payload

  const items = Array.isArray(data)
    ? data
    : data?.items || data?.results || data?.landPlots || payload?.items || []

  return {
    items,
    total:
      data?.totalCount ||
      data?.totalItems ||
      data?.total ||
      payload?.totalCount ||
      items.length,
  }
}

export const isLandPlotActive = (item) => {
  if (typeof item?.isActive === 'boolean') return item.isActive
  const status = String(item?.status || '').toLowerCase()
  return !['inactive', 'suspended', 'deactivated', 'ngừng hoạt động'].includes(status)
}

export const getStatusLabel = (item) =>
  isLandPlotActive(item) ? 'Hoạt động' : 'Ngừng hoạt động'

export const getOwnershipLabel = (value) =>
  OWNERSHIP_OPTIONS.find((item) => item.value === value)?.label || displayValue(value)

export const formatLandArea = (area, unit = 'ha') => {
  if (area == null || area === '') return 'Chưa cập nhật'
  const numeric = Number(area)
  if (Number.isNaN(numeric)) return displayValue(area)
  return unit === 'm2' ? `${numeric.toLocaleString('vi-VN')} m²` : `${numeric} ha`
}

export const buildLandPlotPayload = (values, polygonData, farmId) => {
  const areaM2 = polygonData?.areaM2 || 0
  const area =
    values.areaUnit === 'm2'
      ? Number((areaM2 || values.area || 0).toFixed(2))
      : Number((values.area ?? areaToHectares(areaM2)).toFixed(4))

  const center = polygonData?.geoJSON
    ? parseBoundaryJson(polygonData.boundaryJson)
    : null

  let latitude = values.latitude
  let longitude = values.longitude

  if (center?.coordinates?.[0]?.length) {
    const ring = center.coordinates[0]
    const points =
      ring.length > 1 &&
      ring[0][0] === ring[ring.length - 1][0] &&
      ring[0][1] === ring[ring.length - 1][1]
        ? ring.slice(0, -1)
        : ring
    latitude =
      points.reduce((sum, point) => sum + point[1], 0) / points.length
    longitude =
      points.reduce((sum, point) => sum + point[0], 0) / points.length
  }

  return {
    farmId,
    name: values.name?.trim(),
    code: values.code?.trim(),
    area: area || 0.0001,
    areaUnit: values.areaUnit,
    address: values.address?.trim() || null,
    ownershipType: values.ownershipType || null,
    soilTypeId: values.soilTypeId || null,
    latitude: latitude ?? null,
    longitude: longitude ?? null,
    boundaryJson: polygonData?.boundaryJson || null,
    imageUrl: values.imageUrl || null,
    description: values.description?.trim() || null,
    status: values.status || 'Active',
  }
}

