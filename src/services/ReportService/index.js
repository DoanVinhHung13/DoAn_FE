import http from '../01_axios'
import {
  apiGetDashboardStats,
  apiGetJournalStatus,
  apiGetActivityTimeline,
} from './urls'

const getDashboardStats = () => http.get(apiGetDashboardStats)
const getJournalStatus = (params) => http.get(apiGetJournalStatus, { params })
const getActivityTimeline = (params) => http.get(apiGetActivityTimeline, { params })

const ReportService = {
  getDashboardStats,
  getJournalStatus,
  getActivityTimeline,
}

export default ReportService
