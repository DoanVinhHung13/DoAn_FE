import http from '../01_axios'
import {
  apiCreateCultivationDailyLog,
  apiGetDailyLogsByTask,
  apiGetDailyLogsByStage,
  apiGetDailyLogTaskSummary,
  apiGetMaterialRecommendations,
} from './urls'

const silentConfig = { skipNotice: true }

const create = (body) => http.post(apiCreateCultivationDailyLog, body)

const getByTask = (taskId) =>
  http.get(apiGetDailyLogsByTask(taskId), silentConfig)

const getByStage = (stageId) =>
  http.get(apiGetDailyLogsByStage(stageId), silentConfig)

const getTaskSummary = (taskId) =>
  http.get(apiGetDailyLogTaskSummary(taskId), silentConfig)

const getRecommendations = (body) =>
  http.post(apiGetMaterialRecommendations, body, silentConfig)

const CultivationDailyLogService = {
  create,
  getByTask,
  getByStage,
  getTaskSummary,
  getRecommendations,
}

export default CultivationDailyLogService
