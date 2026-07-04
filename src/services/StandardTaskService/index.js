/**
 * StandardTaskService — API tác vụ mẫu
 * Swagger: https://api.eapls.io.vn/swagger/index.html → nhóm "StandardTasks"
 *
 * GET    /api/standard-tasks              → getAll(params)
 * POST   /api/standard-tasks              → create(body)
 * GET    /api/standard-tasks/{id}         → getById(id)
 * PUT    /api/standard-tasks/{id}         → update(id, body)
 * DELETE /api/standard-tasks/{id}         → remove(id)
 * PUT    /api/standard-tasks/{id}/status  → toggleStatus(id, body)
 *
 * CreateStandardTaskRequest / UpdateStandardTaskRequest schema:
 *   { title: string (req, max 200), description?: string, isActive: boolean,
 *     applyTarget: string (req) - "ALL" | "CATEGORY" | "SPECIFIC",
 *     cropCatalogId?: uuid, cropIds?: uuid[] }
 */
import http from '../01_axios'
import {
  apiCreateTask,
  apiDeleteTask,
  apiGetTaskById,
  apiGetTasks,
  apiToggleTaskStatus,
  apiUpdateTask,
} from './urls'

/**
 * GET /api/standard-tasks
 * params: { PageIndex, PageSize, SearchKeyword, Status? }
 */
const getAll = (params) => http.get(apiGetTasks, { params })

/**
 * GET /api/standard-tasks/{id}
 */
const getById = (id) => http.get(apiGetTaskById(id))

/**
 * POST /api/standard-tasks
 * body: { title, applyTarget, description?, isActive?, cropCatalogId?, cropIds? }
 */
const create = (body) => http.post(apiCreateTask, body)

/**
 * PUT /api/standard-tasks/{id}
 * body: { title, applyTarget, description?, isActive?, cropCatalogId?, cropIds? }
 */
const update = (id, body) => http.put(apiUpdateTask(id), body)

/**
 * DELETE /api/standard-tasks/{id}
 */
const remove = (id) => http.delete(apiDeleteTask(id))

/**
 * PUT /api/standard-tasks/{id}/status
 * body: { isActive: boolean }
 */
const toggleStatus = (id, body) => http.put(apiToggleTaskStatus(id), body)

const TaskService = {
  getAll,
  getById,
  create,
  update,
  remove,
  toggleStatus,
}

export default TaskService
