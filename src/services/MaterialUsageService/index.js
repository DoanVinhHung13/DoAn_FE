import http from "../01_axios"
import {
  apiCreateMaterialUsage,
  apiDeleteMaterialUsage,
  apiMaterialUsageHistory,
  apiMaterialUsagesByDailyLog,
  apiUpdateMaterialUsage,
} from "./urls"

const silentConfig = { skipNotice: true }
const getByDailyLog = dailyLogId =>
  http.get(apiMaterialUsagesByDailyLog(dailyLogId), silentConfig)
const create = (dailyLogId, body) =>
  http.post(apiCreateMaterialUsage(dailyLogId), body, silentConfig)
const update = (dailyLogId, usageId, body) =>
  http.put(apiUpdateMaterialUsage(dailyLogId, usageId), body, silentConfig)
const remove = (dailyLogId, usageId) =>
  http.delete(apiDeleteMaterialUsage(dailyLogId, usageId), silentConfig)
const getHistory = params =>
  http.get(apiMaterialUsageHistory, { params, ...silentConfig })

export default { getByDailyLog, create, update, remove, getHistory }
