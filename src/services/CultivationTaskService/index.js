import http from "../01_axios"
import {
  apiAssignCultivationTask,
  apiCancelCultivationTask,
  apiCreateCultivationTask,
  apiCreateCultivationTaskBulk,
  apiDeleteCultivationTask,
  apiGetCultivationTaskById,
  apiGetCultivationTasks,
  apiGetLeaderSummary,
  apiGetMyCultivationTasks,
  apiGetMyLogbookSummaries,
  apiOrderCultivationTasks,
  apiReorderCultivationTasks,
  apiStartCultivationTask,
  apiSubmitTaskSummary,
  apiUpdateCultivationTask,
} from "./urls"

const silentConfig = { skipNotice: true }

const getAll = params =>
  http.get(apiGetCultivationTasks, { params, skipNotice: true })

const getMyTasks = params =>
  http.get(apiGetMyCultivationTasks, { params, skipNotice: true })

const getById = id => http.get(apiGetCultivationTaskById(id), silentConfig)

const create = body => http.post(apiCreateCultivationTask, body)

const createBulk = (body, config = {}) =>
  http.post(apiCreateCultivationTaskBulk, body, config)

const order = body => http.post(apiOrderCultivationTasks, body)

const update = (id, body) => http.put(apiUpdateCultivationTask(id), body)

const assign = (id, body, config = {}) =>
  http.post(apiAssignCultivationTask(id), body, config)

const remove = (id, config = {}) =>
  http.delete(apiDeleteCultivationTask(id), config)

const start = id => http.post(apiStartCultivationTask(id))

const cancel = (id, config = {}) =>
  http.post(apiCancelCultivationTask(id), null, config)

const getLeaderSummary = id => http.get(apiGetLeaderSummary(id), silentConfig)

/** Body: { descriptionSummary, completedDate } */
const submitSummary = (id, body) => http.post(apiSubmitTaskSummary(id), body)

// Farm Leader: left tree panel - logbook list with task counts
const getMyLogbookSummaries = (params, config = {}) =>
  http.get(apiGetMyLogbookSummaries, { ...config, params })

// Farm Leader: right panel - logbook detail + tasks (optional stageId, statuses)
const getLogbookById = (logbookId, params, config = {}) =>
  http.get(apiGetLogbookById(logbookId), { ...config, params })

/**
 * Reorder tasks: Swap order between 2 tasks in a stage
 * Body: { cultivationLogbookId, cultivationStageId, taskIds: [taskId1, taskId2] }
 */
const reorder = (body, config = {}) =>
  http.put(apiReorderCultivationTasks, body, config)

const CultivationTaskService = {
  getAll,
  getMyTasks,
  getById,
  create,
  createBulk,
  order,
  update,
  assign,
  remove,
  start,
  cancel,
  getLeaderSummary,
  submitSummary,
  getMyLogbookSummaries,
  getLogbookById,
  reorder,
}

export default CultivationTaskService
