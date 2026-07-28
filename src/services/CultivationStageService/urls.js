// Cultivation Stages API endpoints
// Corresponds to Swagger API: /api/cultivation-stages

export const apiGetCultivationStages = '/cultivation-stages'
export const apiCreateCultivationStage = '/cultivation-stages'
export const apiGetCultivationStageById = (id) => `/cultivation-stages/${id}`
export const apiUpdateCultivationStage = (id) => `/cultivation-stages/${id}`
export const apiDeleteCultivationStage = (id) => `/cultivation-stages/${id}`

// Get stages by logbook ID
// Swagger: GET /api/cultivation-stages/logbook/{logbookId}
export const apiGetStagesByLogbook = (logbookId) => `/cultivation-stages/logbook/${logbookId}`

// Get stage logs
export const apiGetCultivationStageLogs = (stageId) => `/cultivation-stages/${stageId}/logs`

// Swagger: GET  /api/cultivation-stages/{id}/summary
//          POST /api/cultivation-stages/{id}/official-logs
//          POST /api/cultivation-stages/{id}/submit-review
//          POST /api/cultivation-stages/{id}/approve-review
//          POST /api/cultivation-stages/{id}/reject-review
export const apiGetCultivationStageSummary = (id) => `/cultivation-stages/${id}/summary`
export const apiCreateOfficialLogs = (id) => `/cultivation-stages/${id}/official-logs`
export const apiCompleteCultivationStage = (id) => `/cultivation-stages/${id}/complete`
export const apiSubmitStageReview = (id) => `/cultivation-stages/${id}/submit-review`
export const apiApproveStageReview = (id) => `/cultivation-stages/${id}/approve-review`
export const apiRejectStageReview = (id) => `/cultivation-stages/${id}/reject-review`
