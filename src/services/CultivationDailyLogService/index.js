import http from '../01_axios'
import {
  apiCreateCultivationDailyLog,
  apiGetDailyLogsByTask,
  apiGetMaterialRemainingArea,
  apiGetDailyLogsByStage,
  apiGetDailyLogTaskSummary,
  apiGetMaterialRecommendations,
} from './urls'

const silentConfig = { skipNotice: true }

const create = (body) => http.post(apiCreateCultivationDailyLog, body)

const getByTask = (taskId) =>
  http.get(apiGetDailyLogsByTask(taskId), silentConfig)

const getRemainingArea = (taskId, materialId) =>
  http.get(apiGetMaterialRemainingArea(taskId, materialId), silentConfig)

const getByStage = (stageId) =>
  http.get(apiGetDailyLogsByStage(stageId), silentConfig)

const getTaskSummary = (taskId) =>
  http.get(apiGetDailyLogTaskSummary(taskId), silentConfig)

const getRecommendations = (body) =>
  http.post(apiGetMaterialRecommendations, body, silentConfig)

const CultivationDailyLogService = {
  create,
  getByTask,
  getRemainingArea,
  getByStage,
  getTaskSummary,
  getRecommendations,
}

export default CultivationDailyLogService
