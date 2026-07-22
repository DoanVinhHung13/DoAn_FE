import http from '../01_axios'
import {
  apiCreateCultivationDailyLog,
  apiGetDailyLogsByTask,
  apiGetDailyLogsByStage,
  apiGetDailyLogTaskSummary,
} from './urls'

const silentConfig = { skipNotice: true }

const create = (body) => http.post(apiCreateCultivationDailyLog, body)

const getByTask = (taskId) =>
  http.get(apiGetDailyLogsByTask(taskId), silentConfig)

const getByStage = (stageId) =>
  http.get(apiGetDailyLogsByStage(stageId), silentConfig)

const getTaskSummary = (taskId) =>
  http.get(apiGetDailyLogTaskSummary(taskId), silentConfig)

const CultivationDailyLogService = {
  create,
  getByTask,
  getByStage,
  getTaskSummary,
}

export default CultivationDailyLogService
