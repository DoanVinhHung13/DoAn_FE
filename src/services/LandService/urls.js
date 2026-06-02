// Land API endpoints
export const apiGetLands = '/api/lands'
export const apiGetLandById = (id) => `/api/lands/${id}`
export const apiCreateLand = '/api/lands'
export const apiUpdateLand = (id) => `/api/lands/${id}`
export const apiDeleteLand = (id) => `/api/lands/${id}`
export const apiChangeLandStatus = (id) => `/api/lands/${id}/status`
export const apiGetLandsByArea = (areaId) => `/api/lands/area/${areaId}`
export const apiGetLandStats = '/api/lands/stats'
export const apiGetLandGeoJson = (id) => `/api/lands/${id}/geojson`
