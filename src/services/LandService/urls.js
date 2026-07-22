// Land API endpoints
export const apiGetLands = '/lands'
export const apiGetLandById = (id) => `/lands/${id}`
export const apiCreateLand = '/lands'
export const apiUpdateLand = (id) => `/lands/${id}`
export const apiDeleteLand = (id) => `/lands/${id}`
export const apiChangeLandStatus = (id) => `/lands/${id}/status`
export const apiGetLandsByArea = (areaId) => `/lands/area/${areaId}`
export const apiGetLandStats = '/lands/stats'
export const apiGetLandGeoJson = (id) => `/lands/${id}/geojson`
