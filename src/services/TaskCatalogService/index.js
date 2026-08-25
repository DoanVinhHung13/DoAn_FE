/**
 * TaskCatalogService — danh mục công việc
 * Swagger: /api/task-catalogs
 *
 * CreateTaskCatalogRequest: { cropCatalogId (req), cropId (req), name (req), description? }
 */
import http from "../01_axios"
import {
  apiCreateTaskCatalog,
  apiDeleteTaskCatalog,
  apiGetTaskCatalogById,
  apiGetTaskCatalogs,
  apiUpdateTaskCatalog,
} from "./urls"

const silentConfig = { skipNotice: true }

const getTaskCatalogs = (params, config = {}) =>
  http.get(apiGetTaskCatalogs, { params, ...silentConfig, ...config })

const getTaskCatalogById = id =>
  http.get(apiGetTaskCatalogById(id), silentConfig)

const createTaskCatalog = (body, config = {}) =>
  http.post(apiCreateTaskCatalog, body, config)

const updateTaskCatalog = (id, body, config = {}) =>
  http.put(apiUpdateTaskCatalog(id), body, config)

const deleteTaskCatalog = id => http.delete(apiDeleteTaskCatalog(id))

const TaskCatalogService = {
  getTaskCatalogs,
  getTaskCatalogById,
  createTaskCatalog,
  updateTaskCatalog,
  deleteTaskCatalog,
}

export default TaskCatalogService
