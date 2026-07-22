// TaskCatalogs API endpoints
// Swagger: /api/task-catalogs
// Thay thế /standard-tasks (không có trong Swagger)

export const apiGetTaskCatalogs = '/task-catalogs'
export const apiCreateTaskCatalog = '/task-catalogs'
export const apiGetTaskCatalogById = (id) => `/task-catalogs/${id}`
export const apiUpdateTaskCatalog = (id) => `/task-catalogs/${id}`
export const apiDeleteTaskCatalog = (id) => `/task-catalogs/${id}`
