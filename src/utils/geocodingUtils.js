const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org/search'
const GEOCODING_ERROR_MESSAGE = 'Không thể tìm kiếm vị trí lúc này. Vui lòng thử lại.'

export const isExternalAbortError = error =>
  error?.name === 'AbortError' || error?.code === 'ABORT_ERR'

const createGeocodingError = () => {
  const error = new Error(GEOCODING_ERROR_MESSAGE)
  error.type = 'external-service'
  error.service = 'nominatim'
  return error
}

/**
 * Tìm địa chỉ qua Nominatim (OpenStreetMap).
 * Ưu tiên kết quả tại Việt Nam.
 */
export async function searchAddress(query, { limit = 6, signal } = {}) {
  const keyword = query?.trim()
  if (!keyword || keyword.length < 2) return []

  const params = new URLSearchParams({
    q: keyword,
    format: 'json',
    addressdetails: '1',
    limit: String(limit),
    countrycodes: 'vn',
  })

  const response = await fetch(`${NOMINATIM_BASE}?${params}`, {
    headers: {
      Accept: 'application/json',
      'Accept-Language': 'vi',
    },
    signal,
  })

  if (!response.ok) {
    throw createGeocodingError()
  }

  let results
  try {
    results = await response.json()
  } catch {
    throw createGeocodingError()
  }

  if (!Array.isArray(results)) throw createGeocodingError()

  return results
    .map(item => ({
      id: item?.place_id,
      label: item?.display_name,
      latitude: Number(item?.lat),
      longitude: Number(item?.lon),
      type: item?.type,
      class: item?.class,
    }))
    .filter(item => item.id != null && item.label && Number.isFinite(item.latitude) && Number.isFinite(item.longitude))
}
