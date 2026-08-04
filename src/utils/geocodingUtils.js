/**
 * geocodingUtils.js
 * Tìm kiếm địa chỉ qua OpenMap.vn API (https://mapapis.openmap.vn/v1)
 * – Autocomplete: gợi ý real-time khi user gõ
 * – Place Detail: lấy tọa độ chính xác từ place_id
 * Fallback về Nominatim nếu VITE_OPENMAP_API_KEY không được cấu hình.
 */

const OPENMAP_BASE = 'https://mapapis.openmap.vn/v1'
const OPENMAP_API_KEY = import.meta.env.VITE_OPENMAP_API_KEY

// Fallback: Nominatim (OpenStreetMap) khi không có API key
const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org/search'

const GEOCODING_ERROR_MESSAGE = 'Không thể tìm kiếm vị trí lúc này. Vui lòng thử lại.'

export const isExternalAbortError = (error) =>
  error?.name === 'AbortError' || error?.code === 'ABORT_ERR'

const createGeocodingError = (service = 'openmap') => {
  const error = new Error(GEOCODING_ERROR_MESSAGE)
  error.type = 'external-service'
  error.service = service
  return error
}

// ─── OpenMap.vn ──────────────────────────────────────────────────────────────

/**
 * Autocomplete: trả về danh sách gợi ý địa chỉ (chưa có tọa độ).
 * Mỗi item có: { place_id, description, mainText, secondaryText }
 */
export async function autocompleteAddress(query, { signal, location } = {}) {
  const keyword = query?.trim()
  if (!keyword || keyword.length < 2) return []

  const params = new URLSearchParams({
    input: keyword,
    apikey: OPENMAP_API_KEY,
  })

  // Nếu có vị trí hiện tại → bias kết quả về gần đó
  if (location) {
    params.set('location', `${location.lat},${location.lng}`)
  }

  const response = await fetch(`${OPENMAP_BASE}/autocomplete?${params}`, {
    headers: { Accept: 'application/json' },
    signal,
  })

  if (!response.ok) throw createGeocodingError()

  let data
  try {
    data = await response.json()
  } catch {
    throw createGeocodingError()
  }

  if (data?.status !== 'OK' || !Array.isArray(data?.predictions)) return []

  return data.predictions.map((item) => ({
    place_id: item.place_id,
    description: item.description,
    mainText: item.structured_formatting?.main_text ?? item.description,
    secondaryText: item.structured_formatting?.secondary_text ?? '',
  }))
}

/**
 * Place Detail: lấy tọa độ (lat/lng) từ place_id.
 * Response OpenMap: features[0].geometry.coordinates = [lng, lat]
 */
export async function getPlaceDetail(placeId, { signal } = {}) {
  const params = new URLSearchParams({
    ids: placeId,
    apikey: OPENMAP_API_KEY,
  })

  const response = await fetch(`${OPENMAP_BASE}/place?${params}`, {
    headers: { Accept: 'application/json' },
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
  const label = feature.properties?.label ?? ''

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) throw createGeocodingError()

  return { latitude: lat, longitude: lng, label }
}

// ─── Nominatim fallback ───────────────────────────────────────────────────────

async function searchAddressNominatim(query, { limit = 6, signal } = {}) {
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    addressdetails: '1',
    limit: String(limit),
    countrycodes: 'vn',
  })

  const response = await fetch(`${NOMINATIM_BASE}?${params}`, {
    headers: { Accept: 'application/json', 'Accept-Language': 'vi' },
    signal,
  })

  if (!response.ok) throw createGeocodingError('nominatim')

  let results
  try {
    results = await response.json()
  } catch {
    throw createGeocodingError('nominatim')
  }

  if (!Array.isArray(results)) throw createGeocodingError('nominatim')

  return results
    .map((item) => ({
      id: item?.place_id,
      label: item?.display_name,
      latitude: Number(item?.lat),
      longitude: Number(item?.lon),
      type: item?.type,
      class: item?.class,
    }))
    .filter(
      (item) =>
        item.id != null &&
        item.label &&
        Number.isFinite(item.latitude) &&
        Number.isFinite(item.longitude),
    )
}

// ─── Unified API: dùng bởi LandPlotMap ──────────────────────────────────────

/**
 * searchAddress — giao diện thống nhất cho LandPlotMap.
 *
 * Nếu có VITE_OPENMAP_API_KEY → dùng OpenMap.vn Autocomplete.
 * Ngược lại → fallback Nominatim.
 *
 * Trả về mảng: [{ id, label, latitude, longitude, place_id? }]
 *  - Với OpenMap: latitude/longitude = null (chưa có), cần gọi getPlaceDetail() khi chọn
 *  - Với Nominatim: latitude/longitude đầy đủ ngay
 */
export async function searchAddress(query, { limit = 6, signal } = {}) {
  const keyword = query?.trim()
  if (!keyword || keyword.length < 2) return []

  if (!OPENMAP_API_KEY) {
    // Fallback Nominatim
    return searchAddressNominatim(keyword, { limit, signal })
  }

  const suggestions = await autocompleteAddress(keyword, { signal })

  // Map sang format thống nhất; tọa độ sẽ được resolve khi user chọn (qua place_id)
  return suggestions.map((s) => ({
    id: s.place_id,
    place_id: s.place_id,
    label: s.description,
    mainText: s.mainText,
    secondaryText: s.secondaryText,
    // Tọa độ chưa có — sẽ fetch qua getPlaceDetail() khi user click chọn
    latitude: null,
    longitude: null,
  }))
}
