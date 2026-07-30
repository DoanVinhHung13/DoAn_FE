// CultivationDailyLog API endpoints
// Swagger: POST /api/cultivation-daily-logs
//          GET  /api/cultivation-daily-logs/task/{taskId}
//          GET  /api/cultivation-daily-logs/stage/{stageId}
//          GET  /api/cultivation-daily-logs/task/{taskId}/summary
//          POST /api/cultivation-daily-logs/recommendations

export const apiCreateCultivationDailyLog = '/cultivation-daily-logs'
export const apiGetDailyLogsByTask = (taskId) => `/cultivation-daily-logs/task/${taskId}`
export const apiGetDailyLogsByStage = (stageId) => `/cultivation-daily-logs/stage/${stageId}`
export const apiGetDailyLogTaskSummary = (taskId) => `/cultivation-daily-logs/task/${taskId}/summary`
export const apiGetMaterialRecommendations = '/cultivation-daily-logs/recommendations'
