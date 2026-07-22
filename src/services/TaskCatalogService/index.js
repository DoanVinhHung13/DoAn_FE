/**
 * TaskCatalogService — danh mục công việc
 * Swagger: /api/task-catalogs
 *
 * CreateTaskCatalogRequest: { name (req), description? }
 */
import http from '../01_axios'
import {
  apiGetTaskCatalogs,
  apiCreateTaskCatalog,
  apiGetTaskCatalogById,
  apiUpdateTaskCatalog,
  apiDeleteTaskCatalog,
} from './urls'

const silentConfig = { skipNotice: true }

const getAll = (params) => http.get(apiGetTaskCatalogs, { params, ...silentConfig })

const getById = (id) => http.get(apiGetTaskCatalogById(id), silentConfig)

const create = (body) => http.post(apiCreateTaskCatalog, body)

const update = (id, body) => http.put(apiUpdateTaskCatalog(id), body)

const remove = (id) => http.delete(apiDeleteTaskCatalog(id))

const TaskCatalogService = {
  getAll,
  getById,
  create,
  update,
  remove,
}

export default TaskCatalogService
