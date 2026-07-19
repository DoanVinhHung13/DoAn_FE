import http from '../01_axios'
import {
  apiGetCultivationLogs,
  apiCreateCultivationLog,
  apiGetCultivationLogById,
  apiUpdateCultivationLog,
  apiDeleteCultivationLog,
  apiApproveCultivationLog,
  apiRejectCultivationLog,
  apiSaveInspectionDraft,
  apiGetLogbookLogs,
  apiGetLandPlotLogs,
  apiGetQualityInspections,
  apiGetQualityInspectionById,
  apiUploadLogImages,
} from './urls'

const getAll = (params) => {
  return http.get(apiGetCultivationLogs, { params })
}

const getById = (id) => {
  return http.get(apiGetCultivationLogById(id))
}

const create = (body, config) => {
  return http.post(apiCreateCultivationLog, body, config)
}

const update = (id, body, config) => {
  return http.put(apiUpdateCultivationLog(id), body, config)
}

const deleteById = (id) => {
  return http.delete(apiDeleteCultivationLog(id))
}

const approve = (id, body) => {
  return http.post(apiApproveCultivationLog(id), body)
}

const reject = (id, body) => {
  return http.post(apiRejectCultivationLog(id), body)
}

const saveInspectionDraft = (id, body) => {
  return http.post(apiSaveInspectionDraft(id), body)
}

const getLogbookLogs = (logbookId) => {
  return http.get(apiGetLogbookLogs(logbookId))
}

const getLandPlotLogs = (landPlotId) => {
  return http.get(apiGetLandPlotLogs(landPlotId))
}

const getQualityInspections = (params) => {
  return http.get(apiGetQualityInspections, { params })
}

const getQualityInspectionById = (id) => {
  return http.get(apiGetQualityInspectionById(id))
}

const uploadImages = (id, formData) => {
  return http.post(apiUploadLogImages(id), formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

const CultivationLogService = {
  getAll,
  getById,
  create,
  update,
  deleteById,
  approve,
  reject,
  saveInspectionDraft,
  getLogbookLogs,
  getLandPlotLogs,
  getQualityInspections,
  getQualityInspectionById,
  uploadImages,
}

export default CultivationLogService
