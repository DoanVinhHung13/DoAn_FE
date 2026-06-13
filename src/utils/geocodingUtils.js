const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org/search'

/**
 * Tìm địa chỉ qua Nominatim (OpenStreetMap).
 * Ưu tiên kết quả tại Việt Nam.
 */
export async function searchAddress(query, { limit = 6 } = {}) {
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
  })

  if (!response.ok) {
    throw new Error('Không thể tìm kiếm địa chỉ. Vui lòng thử lại.')
  }

  const results = await response.json()
  return (results || []).map((item) => ({
    id: item.place_id,
    label: item.display_name,
    latitude: Number(item.lat),
    longitude: Number(item.lon),
    type: item.type,
    class: item.class,
  }))
}
