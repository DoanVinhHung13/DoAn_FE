// Cultivation Tasks API endpoints
// Corresponds to Swagger API: POST /api/cultivation-tasks (Create Work Task)
// Corresponds to Swagger API: POST /api/cultivation-tasks/{id}/start (Active Work Task)

export const apiGetCultivationTasks = '/cultivation-tasks'
export const apiCreateCultivationTask = '/cultivation-tasks'
export const apiGetCultivationTaskById = (id) => `/cultivation-tasks/${id}`
export const apiUpdateCultivationTask = (id) => `/cultivation-tasks/${id}`
export const apiDeleteCultivationTask = (id) => `/cultivation-tasks/${id}`

// Start/Activate a cultivation task
// Swagger: POST /api/cultivation-tasks/{id}/start
export const apiStartCultivationTask = (id) => `/cultivation-tasks/${id}/start`
