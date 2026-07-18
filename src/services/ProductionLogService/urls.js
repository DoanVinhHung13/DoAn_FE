export const apiProductionLogs = '/production-logs'
export const apiProductionLogById = (id) => `/production-logs/${id}`
export const apiProductionPlanLogs = (planId) =>
  `/production-plans/${planId}/logs`
export const apiProductionLogImages = (id) =>
  `/production-logs/${id}/images`
