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
  apiCreateStandardTask,
  apiDeleteStandardTask,
  apiGetStandardTaskById,
  apiGetStandardTasks,
  apiToggleStandardTaskStatus,
  apiUpdateStandardTask,
} from './urls'

/**
 * GET /api/standard-tasks
 * params: { PageIndex, PageSize, SearchKeyword, Status? }
 */
const getAll = (params) => http.get(apiGetStandardTasks, { params })

/**
 * GET /api/standard-tasks/{id}
 */
const getById = (id) => http.get(apiGetStandardTaskById(id))

/**
 * POST /api/standard-tasks
 * body: { title, applyTarget, description?, isActive?, cropCatalogId?, cropIds? }
 */
const create = (body) => http.post(apiCreateStandardTask, body)

/**
 * PUT /api/standard-tasks/{id}
 * body: { title, applyTarget, description?, isActive?, cropCatalogId?, cropIds? }
 */
const update = (id, body) => http.put(apiUpdateStandardTask(id), body)

/**
 * DELETE /api/standard-tasks/{id}
 */
const remove = (id) => http.delete(apiDeleteStandardTask(id))

/**
 * PUT /api/standard-tasks/{id}/status
 * body: { isActive: boolean }
 */
const toggleStatus = (id, body) => http.put(apiToggleStandardTaskStatus(id), body)

const StandardTaskService = {
  getAll,
  getById,
  create,
  update,
  remove,
  toggleStatus,
}

export default StandardTaskService
