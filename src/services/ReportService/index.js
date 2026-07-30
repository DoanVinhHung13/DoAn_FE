import http from '../01_axios'
import {
  apiGetDashboardOverview,
  apiGetCultivatedAreaReport,
  apiGetMaterialUsageReport,
  apiGetTaskProgressReport,
  apiGetLaborReport,
  apiGetHarvestYieldReport,
  apiGetQrScanReport,
  apiExportReportExcel,
  apiExportReportPdf,
} from './urls'

const getDashboardOverview = (params) =>
  http.get(apiGetDashboardOverview, { params })

const getCultivatedAreaReport = (params) =>
  http.get(apiGetCultivatedAreaReport, { params })

const getMaterialUsageReport = (params) =>
  http.get(apiGetMaterialUsageReport, { params })

const getTaskProgressReport = (params) =>
  http.get(apiGetTaskProgressReport, { params })

const getLaborReport = (params) =>
  http.get(apiGetLaborReport, { params })

const getHarvestYieldReport = (params) =>
  http.get(apiGetHarvestYieldReport, { params })

const getQrScanReport = (params) =>
  http.get(apiGetQrScanReport, { params })

const exportReportExcel = (params) =>
  http.get(apiExportReportExcel, { params, responseType: 'blob' })

const exportReportPdf = (params) =>
  http.get(apiExportReportPdf, { params, responseType: 'blob' })

const ReportService = {
  getDashboardOverview,
  getCultivatedAreaReport,
  getMaterialUsageReport,
  getTaskProgressReport,
  getLaborReport,
  getHarvestYieldReport,
  getQrScanReport,
  exportReportExcel,
  exportReportPdf,
}

export default ReportService
