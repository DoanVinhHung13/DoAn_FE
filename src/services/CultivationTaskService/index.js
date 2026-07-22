import http from '../01_axios'
import {
  apiCreateCultivationTask,
  apiCreateCultivationTaskBulk,
  apiDeleteCultivationTask,
  apiGetCultivationTaskById,
  apiGetCultivationTasks,
  apiUpdateCultivationTask,
  apiStartCultivationTask,
  apiGetLeaderSummary,
  apiSubmitTaskSummary,
} from './urls'

const silentConfig = { skipNotice: true }

const getAll = (params) =>
  http.get(apiGetCultivationTasks, { params, skipNotice: true })

const getById = (id) =>
  http.get(apiGetCultivationTaskById(id), silentConfig)

const create = (body) =>
  http.post(apiCreateCultivationTask, body)

const createBulk = (body) =>
  http.post(apiCreateCultivationTaskBulk, body)

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

const CultivationTaskService = {
  getAll,
  getById,
  create,
  createBulk,
  update,
  remove,
  start,
  getLeaderSummary,
  submitSummary,
}

export default CultivationTaskService
