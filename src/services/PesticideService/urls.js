// Pesticides API endpoints
// Swagger: /api/pesticides
// Thay thế /crop-protection (không có trong Swagger)

export const apiGetPesticides = '/pesticides'
export const apiCreatePesticide = '/pesticides'
export const apiGetPesticideById = (id) => `/pesticides/${id}`
export const apiUpdatePesticide = (id) => `/pesticides/${id}`
export const apiDeletePesticide = (id) => `/pesticides/${id}`
export const apiTogglePesticideStatus = (id) => `/pesticides/${id}/status`
export const apiDeactivatePesticide = apiTogglePesticideStatus
export const apiReactivatePesticide = apiTogglePesticideStatus
export const apiGetPesticideSelection = '/pesticides/selection'
