import http from '../01_axios'
import {
  apiCreateTask,
  apiDeleteTask,
  apiGetTaskById,
  apiGetTasks,
  apiToggleTaskStatus,
  apiUpdateTask,
} from './urls'

const getAll = (params) => http.get(apiGetTasks, { params })
const getById = (id) => http.get(apiGetTaskById(id))
const create = (body) => http.post(apiCreateTask, body)
const update = (id, body) => http.put(apiUpdateTask(id), body)
const remove = (id) => http.delete(apiDeleteTask(id))
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
