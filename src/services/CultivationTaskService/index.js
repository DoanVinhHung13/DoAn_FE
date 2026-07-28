import http from '../01_axios'
import {
  apiCreateCultivationTask,
  apiCreateCultivationTaskBulk,
  apiReorderCultivationTasks,
  apiDeleteCultivationTask,
  apiGetCultivationTaskById,
  apiGetCultivationTasks,
  apiGetMyCultivationTasks,
  apiUpdateCultivationTask,
  apiStartCultivationTask,
  apiGetLeaderSummary,
  apiSubmitTaskSummary,
  apiGetMyLogbookSummaries,
  apiGetLogbookById,
} from './urls'

const silentConfig = { skipNotice: true }

const getAll = (params) =>
  http.get(apiGetCultivationTasks, { params, skipNotice: true })

const getMyTasks = (params) =>
  http.get(apiGetMyCultivationTasks, { params, skipNotice: true })

const getById = (id) =>
  http.get(apiGetCultivationTaskById(id), silentConfig)

const create = (body) =>
  http.post(apiCreateCultivationTask, body)

const createBulk = (body) =>
  http.post(apiCreateCultivationTaskBulk, body)

const reorder = (body) =>
  http.put(apiReorderCultivationTasks, body)

const update = (id, body) =>
  http.put(apiUpdateCultivationTask(id), body)

const remove = (id) =>
  http.delete(apiDeleteCultivationTask(id))

const start = (id) =>
  http.post(apiStartCultivationTask(id))

const getLeaderSummary = (id) =>
  http.get(apiGetLeaderSummary(id), silentConfig)

/** Body: { descriptionSummary, completedAt } */
const submitSummary = (id, body) =>
  http.post(apiSubmitTaskSummary(id), body)

// Farm Leader: left tree panel - logbook list with task counts
const getMyLogbookSummaries = (params) =>
  http.get(apiGetMyLogbookSummaries, { params, skipNotice: true })

// Farm Leader: right panel - logbook detail + tasks (optional stageId, statuses)
const getLogbookById = (logbookId, params) =>
  http.get(apiGetLogbookById(logbookId), { params, skipNotice: true })

const CultivationTaskService = {
  getAll,
  getMyTasks,
  getById,
  create,
  createBulk,
  reorder,
  update,
  remove,
  start,
  getLeaderSummary,
  submitSummary,
  getMyLogbookSummaries,
  getLogbookById,
}

export default CultivationTaskService
