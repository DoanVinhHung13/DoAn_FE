// CropProtectionService/urls.js
// Swagger: https://api.eapls.io.vn/swagger/index.html → nhóm "CropProtection"
//
// GET    /api/crop-protection              → getList (PageIndex, PageSize, SearchKeyword, Status?)
// POST   /api/crop-protection              → create  { name, code, manufacturer?, supplier?, minInventory, unit?, description?, isActive, usages? }
// GET    /api/crop-protection/{id}         → getById
// PUT    /api/crop-protection/{id}         → update  { name, code, manufacturer?, supplier?, minInventory, unit?, description?, isActive, usages? }
// DELETE /api/crop-protection/{id}         → remove (soft-delete)
// PATCH  /api/crop-protection/{id}/status  → toggleStatus { isActive }

export const apiGetCropProtections = '/crop-protection'
export const apiCreateCropProtection = '/crop-protection'
export const apiGetCropProtectionById = (id) => `/crop-protection/${id}`
export const apiUpdateCropProtection = (id) => `/crop-protection/${id}`
export const apiDeleteCropProtection = (id) => `/crop-protection/${id}`
export const apiToggleCropProtectionStatus = (id) => `/crop-protection/${id}/status`
