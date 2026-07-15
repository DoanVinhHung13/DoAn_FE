import http from '../01_axios'
import {
  apiGetFieldLogs,
  apiCreateFieldLog,
  apiGetStageInfo,
  apiFinalizeStage,
} from './urls'

const getStageInfo = (params) => http.get(apiGetStageInfo, { params })
const getHistory = (params) => http.get(apiGetFieldLogs, { params })
const createLog = (body) => http.post(apiCreateFieldLog, body)
const finalizeStage = (body) => http.post(apiFinalizeStage, body)

const FieldLogService = {
  getStageInfo,
  getHistory,
  createLog,
  finalizeStage,
}

export default FieldLogService
