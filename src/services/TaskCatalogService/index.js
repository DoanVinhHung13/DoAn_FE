/**
 * TaskCatalogService — danh mục công việc
 * Swagger: /api/task-catalogs
 *
 * CreateTaskCatalogRequest: { cropCatalogId (req), cropId (req), name (req), description? }
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

const getTaskCatalogs = (params) => http.get(apiGetTaskCatalogs, { params, ...silentConfig })

const getTaskCatalogById = (id) => http.get(apiGetTaskCatalogById(id), silentConfig)

const createTaskCatalog = (body) => http.post(apiCreateTaskCatalog, body)

const updateTaskCatalog = (id, body) => http.put(apiUpdateTaskCatalog(id), body)

const deleteTaskCatalog = (id) => http.delete(apiDeleteTaskCatalog(id))

const TaskCatalogService = {
  getTaskCatalogs,
  getTaskCatalogById,
  createTaskCatalog,
  updateTaskCatalog,
  deleteTaskCatalog,
}

export default TaskCatalogService
