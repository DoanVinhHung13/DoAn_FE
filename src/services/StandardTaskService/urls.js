// StandardTaskService/urls.js
// Swagger: https://api.eapls.io.vn/swagger/index.html → nhóm "StandardTasks"
//
// GET    /api/standard-tasks              → getAll (PageIndex, PageSize, SearchKeyword, Status?)
// POST   /api/standard-tasks              → create  { title, applyTarget, description?, isActive?, cropCatalogId?, cropIds? }
// GET    /api/standard-tasks/{id}         → getById
// PUT    /api/standard-tasks/{id}         → update  { title, applyTarget, description?, isActive?, cropCatalogId?, cropIds? }
// DELETE /api/standard-tasks/{id}         → remove (soft-delete)
// PUT    /api/standard-tasks/{id}/status  → toggleStatus { isActive }

export const apiGetTasks = '/standard-tasks'
export const apiCreateTask = '/standard-tasks'
export const apiGetTaskById = (id) => `/standard-tasks/${id}`
export const apiUpdateTask = (id) => `/standard-tasks/${id}`
export const apiDeleteTask = (id) => `/standard-tasks/${id}`
export const apiToggleTaskStatus = (id) => `/standard-tasks/${id}/status`
