import http from '../01_axios'
import {
  apiGetSystemStats,
  apiGetLogs,
  apiGetAgriModels,
  apiCreateAgriModel,
  apiUpdateAgriModel,
  apiDeleteAgriModel,
} from './urls'

const getSystemStats = () => http.get(apiGetSystemStats)
const getLogs = (params) => http.get(apiGetLogs, { params })
const getAgriModels = (params) => http.get(apiGetAgriModels, { params })
const createAgriModel = (body) => http.post(apiCreateAgriModel, body)
const updateAgriModel = (id, body) => http.put(apiUpdateAgriModel(id), body)
const deleteAgriModel = (id) => http.delete(apiDeleteAgriModel(id))

const SystemService = {
  getSystemStats,
  getLogs,
  getAgriModels,
  createAgriModel,
  updateAgriModel,
  deleteAgriModel,
}

export default SystemService
