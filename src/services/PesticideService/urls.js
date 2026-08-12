// Pesticides API endpoints
// Swagger: /api/pesticides
// Thay thế /crop-protection (không có trong Swagger)

export const apiGetPesticides = '/pesticides'
export const apiCreatePesticide = '/pesticides'
export const apiGetPesticideById = (id) => `/pesticides/${id}`
export const apiUpdatePesticide = (id) => `/pesticides/${id}`
export const apiDeletePesticide = (id) => `/pesticides/${id}`
export const apiTogglePesticideStatus = (id) => `/pesticides/${id}/status`
export const apiDeactivatePesticide = (id) => `/pesticides/${id}/deactivate`
export const apiReactivatePesticide = (id) => `/pesticides/${id}/reactivate`
export const apiGetPesticideSelection = '/pesticides/selection'
