import http from '../01_axios'
import {
  apiProductionLogById,
  apiProductionLogImages,
  apiProductionLogs,
  apiProductionPlanLogs,
} from './urls'

const silent = { skipNotice: true }

const getAll = (params) =>
  http.get(apiProductionLogs, { params, skipNotice: true })
const getById = (id) => http.get(apiProductionLogById(id), silent)
const getByPlan = (planId) =>
  http.get(apiProductionPlanLogs(planId), silent)
const create = (body) => http.post(apiProductionLogs, body, silent)
const update = (id, body) =>
  http.put(apiProductionLogById(id), body, silent)
const remove = (id) => http.delete(apiProductionLogById(id), silent)
const uploadImage = (id, file, description) => {
  const formData = new FormData()
  formData.append('file', file)
  if (description) formData.append('description', description)
  return http.post(apiProductionLogImages(id), formData, silent)
}

export default {
  getAll,
  getById,
  getByPlan,
  create,
  update,
  remove,
  uploadImage,
}
