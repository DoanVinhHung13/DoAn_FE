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
