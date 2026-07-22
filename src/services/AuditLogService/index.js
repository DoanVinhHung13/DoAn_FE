import http from '../01_axios'
import { apiGetAuditLogs } from './urls'

const getAll = (params) =>
  http.get(apiGetAuditLogs, { params, skipNotice: true })

const AuditLogService = {
  getAll,
}

export default AuditLogService
