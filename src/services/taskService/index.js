/**
 * taskService — MOCK SERVICE
 * Task API endpoints are currently INCORRECT in Swagger.
 * All methods return mock resolved promises.
 * Replace implementations when real API is available.
 */

/* eslint-disable no-unused-vars */

/**
 * GET /api/tasks — mock list
 * Returns an empty paginated result
 */
const getAll = (params) =>
  Promise.resolve({
    success: true,
    data: { items: [], totalItems: 0 },
  })

/**
 * GET /api/tasks/:id — mock detail
 */
const getById = (id) =>
  Promise.resolve({ success: true, data: null })

/**
 * POST /api/tasks — mock create
 */
const create = (body) =>
  Promise.resolve({ success: true, data: null })

/**
 * PUT /api/tasks/:id — mock update
 */
const update = (id, body) =>
  Promise.resolve({ success: true, data: null })

/**
 * DELETE /api/tasks/:id — mock delete
 */
const remove = (id) =>
  Promise.resolve({ success: true, data: null })

/**
 * PUT /api/tasks/:id/status — mock toggle status
 */
const toggleStatus = (id, body) =>
  Promise.resolve({ success: true, data: null })

const TaskService = {
  getAll,
  getById,
  create,
  update,
  remove,
  toggleStatus,
}

export default TaskService
