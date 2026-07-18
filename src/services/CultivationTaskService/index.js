import http from '../01_axios'
import {
  apiCreateCultivationTask,
  apiDeleteCultivationTask,
  apiGetCultivationTaskById,
  apiGetCultivationTasks,
  apiUpdateCultivationTask,
} from './urls'

const silentConfig = { skipNotice: true }

const getAll = (params) =>
  http.get(apiGetCultivationTasks, { params, skipNotice: true })
const getById = (id) =>
  http.get(apiGetCultivationTaskById(id), silentConfig)
const create = (body) =>
  http.post(apiCreateCultivationTask, body, silentConfig)
const update = (id, body) =>
  http.put(apiUpdateCultivationTask(id), body, silentConfig)
const remove = (id) =>
  http.delete(apiDeleteCultivationTask(id), silentConfig)

export default { getAll, getById, create, update, remove }
