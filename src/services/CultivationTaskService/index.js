import http from '../01_axios'
import {
  apiCreateCultivationTask,
  apiCreateCultivationTaskBulk,
  apiDeleteCultivationTask,
  apiGetCultivationTaskById,
  apiGetCultivationTasks,
  apiUpdateCultivationTask,
  apiStartCultivationTask,
} from './urls'

const silentConfig = { skipNotice: true }

const getAll = (params) =>
  http.get(apiGetCultivationTasks, { params, skipNotice: true })

const getById = (id) =>
  http.get(apiGetCultivationTaskById(id), silentConfig)

const create = (body) =>
  http.post(apiCreateCultivationTask, body, silentConfig)

const createBulk = (body) =>
  http.post(apiCreateCultivationTaskBulk, body)

const update = (id, body) =>
  http.put(apiUpdateCultivationTask(id), body, silentConfig)

const remove = (id) =>
  http.delete(apiDeleteCultivationTask(id), silentConfig)

// Start/Activate a task
const start = (id) =>
  http.post(apiStartCultivationTask(id), {}, silentConfig)

const CultivationTaskService = {
  getAll,
  getById,
  create,
  createBulk,
  update,
  remove,
  start,
}

export default CultivationTaskService
