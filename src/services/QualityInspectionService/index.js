import http from '../01_axios'
import {
  apiApproveInspection,
  apiQualityInspectionById,
  apiQualityInspections,
  apiRejectInspection,
  apiSaveInspectionDraft,
} from './urls'

const silent = { skipNotice: true }

const getAll = (params) =>
  http.get(apiQualityInspections, { params, skipNotice: true })

const getById = (id) =>
  http.get(apiQualityInspectionById(id), silent)

const saveDraft = (id, body) =>
  http.post(apiSaveInspectionDraft(id), body, silent)

const approve = (id, body) =>
  http.post(apiApproveInspection(id), body, silent)

const reject = (id, body) =>
  http.post(apiRejectInspection(id), body, silent)

export default {
  getAll,
  getById,
  saveDraft,
  approve,
  reject,
}
