export const apiMaterialUsageHistory = "/material-usages"
export const apiMaterialUsagesByDailyLog = dailyLogId =>
  `/material-usages/daily-logs/${dailyLogId}`
export const apiCreateMaterialUsage = dailyLogId =>
  `/material-usages/daily-logs/${dailyLogId}`
export const apiUpdateMaterialUsage = (dailyLogId, usageId) =>
  `/material-usages/daily-logs/${dailyLogId}/${usageId}`
export const apiDeleteMaterialUsage = (dailyLogId, usageId) =>
  `/material-usages/daily-logs/${dailyLogId}/${usageId}`
