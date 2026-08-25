/**
 * geocodingUtils.js
 * Tìm kiếm địa chỉ qua OpenMap.vn API (https://mapapis.openmap.vn/v1)
 * – Autocomplete: gợi ý real-time khi user gõ
 * – Place Detail: lấy tọa độ chính xác từ place_id
 * Bắt buộc phải có VITE_OPENMAP_API_KEY để sử dụng.
 */

const OPENMAP_BASE = "https://mapapis.openmap.vn/v1"
const OPENMAP_API_KEY = import.meta.env.VITE_OPENMAP_API_KEY

const GEOCODING_ERROR_MESSAGE =
  "Không thể tìm kiếm vị trí lúc này. Vui lòng thử lại."
const MISSING_API_KEY_MESSAGE =
  "Chưa cấu hình API key cho OpenMap.vn. Vui lòng liên hệ quản trị viên."

export const isExternalAbortError = error =>
  error?.name === "AbortError" || error?.code === "ABORT_ERR"

const createGeocodingError = () => {
  const error = new Error(GEOCODING_ERROR_MESSAGE)
  error.type = "external-service"
  error.service = "openmap"
  return error
}

const createMissingApiKeyError = () => {
  const error = new Error(MISSING_API_KEY_MESSAGE)
  error.type = "missing-config"
  error.service = "openmap"
  return error
}

// ─── OpenMap.vn ──────────────────────────────────────────────────────────────

/**
 * Autocomplete: trả về danh sách gợi ý địa chỉ (chưa có tọa độ).
 * Mỗi item có: { place_id, description, mainText, secondaryText }
 */
export async function autocompleteAddress(
  query,
  { signal, location, limit = 10 } = {},
) {
  if (!OPENMAP_API_KEY) throw createMissingApiKeyError()

  const keyword = query?.trim()
  if (!keyword || keyword.length < 2) return []

  const params = new URLSearchParams({
    input: keyword,
    admin_v2: "true",
    apikey: OPENMAP_API_KEY,
    limit: String(limit),
  })

  if (location) {
    params.set("location", `${location.lat},${location.lng}`)
  }

  const response = await fetch(`${OPENMAP_BASE}/autocomplete?${params}`, {
    headers: { Accept: "application/json" },
    signal,
  })

  if (!response.ok) throw createGeocodingError()

  let data
  try {
    data = await response.json()
  } catch {
    throw createGeocodingError()
  }

  if (data?.status !== "OK" || !Array.isArray(data?.predictions)) return []

  return data.predictions.map(item => ({
    place_id: item.place_id,
    description: item.description,
    mainText: item.structured_formatting?.main_text ?? item.description,
    secondaryText: item.structured_formatting?.secondary_text ?? "",
  }))
}

/**
 * Place Detail: lấy tọa độ (lat/lng) từ place_id.
 * Response OpenMap: features[0].geometry.coordinates = [lng, lat]
 */
export async function getPlaceDetail(placeId, { signal } = {}) {
  if (!OPENMAP_API_KEY) throw createMissingApiKeyError()

  const params = new URLSearchParams({
    ids: placeId,
    admin_v2: "true",
    apikey: OPENMAP_API_KEY,
  })

  const response = await fetch(`${OPENMAP_BASE}/place?${params}`, {
    headers: { Accept: "application/json" },
    signal,
  })

  if (!response.ok) throw createGeocodingError()

  let data
  try {
    data = await response.json()
  } catch {
    throw createGeocodingError()
  }

  const feature = data?.features?.[0]
  if (!feature) throw createGeocodingError()

  const [lng, lat] = feature.geometry?.coordinates ?? []
  const label = feature.properties?.label ?? ""

  if (!Number.isFinite(lat) || !Number.isFinite(lng))
    throw createGeocodingError()

  return { latitude: lat, longitude: lng, label }
}

// ─── Unified API: dùng bởi LandPlotMap ──────────────────────────────────────

/**
 * searchAddress — giao diện thống nhất cho LandPlotMap.
 *
 * Bắt buộc sử dụng OpenMap.vn Autocomplete API.
 * Yêu cầu có VITE_OPENMAP_API_KEY được cấu hình.
 *
 * Trả về mảng: [{ id, label, latitude, longitude, place_id }]
 * - latitude/longitude = null (chưa có), cần gọi getPlaceDetail() khi chọn
 */
export async function searchAddress(query, { signal, limit = 10 } = {}) {
  if (!OPENMAP_API_KEY) throw createMissingApiKeyError()

  const keyword = query?.trim()
  if (!keyword || keyword.length < 2) return []

  const suggestions = await autocompleteAddress(keyword, { signal, limit })

  return suggestions.map(s => ({
    id: s.place_id,
    place_id: s.place_id,
    label: s.description,
    mainText: s.mainText,
    secondaryText: s.secondaryText,
    latitude: null,
    longitude: null,
  }))
}

/**
 * Reverse Geocoding: chuyển đổi tọa độ (lat, lng) thành chuỗi địa chỉ đọc được.
 * Thử gọi API OpenMap (nếu có API Key), nếu không có hoặc lỗi thì fallback sang OpenStreetMap Nominatim reverse API.
 * Trường hợp ngoại lệ trả về định dạng tọa độ `lat, lng`.
 */
export async function reverseGeocode(latitude, longitude, { signal } = {}) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return ""
  }

  // 1. Thử OpenMap reverse nếu có API Key
  if (OPENMAP_API_KEY) {
    try {
      const params = new URLSearchParams({
        latlng: `${latitude},${longitude}`,
        format: "google",
        admin_v2: "true",
        apikey: OPENMAP_API_KEY,
      })
      const response = await fetch(
        `${OPENMAP_BASE}/geocode/reverse?${params}`,
        {
          headers: { Accept: "application/json" },
          signal,
        },
      )
      if (response.ok) {
        const data = await response.json()
        const label =
          data?.results?.[0]?.formatted_address ||
          data?.results?.[0]?.address ||
          data?.features?.[0]?.properties?.label ||
          data?.display_name
        if (label) return label
      }
    } catch (err) {
      if (isExternalAbortError(err)) throw err
    }
  }

  // 2. Fallback sang OpenStreetMap Nominatim
  try {
    const params = new URLSearchParams({
      format: "jsonv2",
      lat: String(latitude),
      lon: String(longitude),
      "accept-language": "vi",
      zoom: "18",
    })
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?${params}`,
      {
        headers: {
          Accept: "application/json",
        },
        signal,
      },
    )
    if (response.ok) {
      const data = await response.json()
      const label = data?.display_name || data?.name
      if (label) return label
    }
  } catch (err) {
    if (isExternalAbortError(err)) throw err
  }

  // 3. Fallback cuối cùng nếu cả 2 API đều không có thông tin
  return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
}
