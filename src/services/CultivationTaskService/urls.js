// Cultivation Tasks API endpoints
// Corresponds to Swagger API: POST /api/cultivation-tasks (Create Work Task)
// Corresponds to Swagger API: POST /api/cultivation-tasks/{id}/start (Active Work Task)
// Corresponds to Swagger API: POST /api/cultivation-tasks/bulk (Bulk Create Work Task)

export const apiGetCultivationTasks = "/cultivation-tasks"
export const apiGetMyCultivationTasks = "/cultivation-tasks/my-tasks"
export const apiCreateCultivationTask = "/cultivation-tasks"
export const apiCreateCultivationTaskBulk = "/cultivation-tasks/bulk"
export const apiOrderCultivationTasks = "/cultivation-tasks/order"
export const apiGetCultivationTaskById = id => `/cultivation-tasks/${id}`
export const apiUpdateCultivationTask = id => `/cultivation-tasks/${id}`
export const apiAssignCultivationTask = id => `/cultivation-tasks/${id}/assign`
export const apiDeleteCultivationTask = id => `/cultivation-tasks/${id}`
export const apiCancelCultivationTask = id => `/cultivation-tasks/${id}/cancel`

// Start/Activate a cultivation task
// Swagger: POST /api/cultivation-tasks/{id}/start
export const apiStartCultivationTask = id => `/cultivation-tasks/${id}/start`

// Leader summary (bước 4)
// Swagger: GET  /api/cultivation-tasks/{id}/leader-summary
//          POST /api/cultivation-tasks/{id}/summary
export const apiGetLeaderSummary = id =>
  `/cultivation-tasks/${id}/leader-summary`
export const apiSubmitTaskSummary = id => `/cultivation-tasks/${id}/summary`

// Farm Leader: logbook summaries for left tree panel
// Swagger: GET /api/cultivation-tasks/my-logbook-summaries
export const apiGetMyLogbookSummaries =
  "/cultivation-tasks/my-logbook-summaries"

// Farm Leader: logbook detail with tasks (filter by stageId & statuses)
// Swagger: GET /api/cultivation-tasks/logbook/{logbookId}
export const apiGetLogbookById = logbookId =>
  `/cultivation-tasks/logbook/${logbookId}`
