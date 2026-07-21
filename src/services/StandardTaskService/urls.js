// StandardTaskService/urls.js
// Swagger: https://api.eapls.io.vn/swagger/index.html → nhóm "StandardTasks"
//
// GET    /api/standard-tasks              → getAll (PageIndex, PageSize, SearchKeyword, Status?)
// POST   /api/standard-tasks              → create  { title, applyTarget, description?, isActive?, cropCatalogId?, cropIds? }
// GET    /api/standard-tasks/{id}         → getById
// PUT    /api/standard-tasks/{id}         → update  { title, applyTarget, description?, isActive?, cropCatalogId?, cropIds? }
// DELETE /api/standard-tasks/{id}         → remove (soft-delete)
// PUT    /api/standard-tasks/{id}/status  → toggleStatus { isActive }

export const apiGetStandardTasks = '/standard-tasks'
export const apiCreateStandardTask = '/standard-tasks'
export const apiGetStandardTaskById = (id) => `/standard-tasks/${id}`
export const apiUpdateStandardTask = (id) => `/standard-tasks/${id}`
export const apiDeleteStandardTask = (id) => `/standard-tasks/${id}`
export const apiToggleStandardTaskStatus = (id) => `/standard-tasks/${id}/status`
