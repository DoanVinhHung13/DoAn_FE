import http from '../01_axios'
import {
  canReorderStageTasks,
  canReorderTask,
  canReorderTaskList,
} from 'src/utils/cultivationStatus'
import {
  apiCreateCultivationTask,
  apiCreateCultivationTaskBulk,
  apiReorderCultivationTasks,
  apiDeleteCultivationTask,
  apiGetCultivationTaskById,
  apiGetCultivationTasks,
  apiGetMyCultivationTasks,
  apiUpdateCultivationTask,
  apiAssignCultivationTask,
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

const reorder = (body, context = {}) => {
  if (
    !canReorderStageTasks(context.stage, context.logbook) ||
    !canReorderTask(context.task) ||
    !canReorderTaskList(context.tasks)
  ) {
    return Promise.reject(
      new Error('Task order can only be changed before the stage starts.'),
    )
  }

  return http.put(apiReorderCultivationTasks, body)
}

const update = (id, body) =>
  http.put(apiUpdateCultivationTask(id), body)

const assign = (id, body) =>
  http.post(apiAssignCultivationTask(id), body)

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
  assign,
  remove,
  start,
  getLeaderSummary,
  submitSummary,
  getMyLogbookSummaries,
  getLogbookById,
}

export default CultivationTaskService
