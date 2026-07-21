export const apiProductionLogs = '/cultivation-logs'
export const apiProductionLogById = (id) => `/cultivation-logs/${id}`
export const apiProductionPlanLogs = (planId) =>
  `/cultivation-logbooks/${planId}/logs`
export const apiProductionLogImages = (id) =>
  `/cultivation-logs/${id}/images`
