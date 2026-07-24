import http from '../01_axios'
import {
  apiGetCultivationStages,
  apiCreateCultivationStage,
  apiGetCultivationStageById,
  apiUpdateCultivationStage,
  apiDeleteCultivationStage,
  apiGetStagesByLogbook,
  apiGetCultivationStageLogs,
  apiGetCultivationStageSummary,
  apiCreateOfficialLogs,
  apiSubmitStageReview,
  apiApproveStageReview,
  apiRejectStageReview,
} from './urls'

const getAll = (params) => {
  return http.get(apiGetCultivationStages, { params })
}

const getById = (id) => {
  return http.get(apiGetCultivationStageById(id))
}

const getByLogbookId = (logbookId) => {
  return http.get(apiGetStagesByLogbook(logbookId))
}

const getStageLogs = (stageId, params) => {
  return http.get(apiGetCultivationStageLogs(stageId), { params })
}

const create = (body, config) => {
  return http.post(apiCreateCultivationStage, body, config)
}

const update = (id, body, config) => {
  return http.put(apiUpdateCultivationStage(id), body, config)
}

const deleteById = (id) => {
  return http.delete(apiDeleteCultivationStage(id))
}

const getSummary = (id) =>
  http.get(apiGetCultivationStageSummary(id), { skipNotice: true })

const createOfficialLogs = (id, body) =>
  http.post(apiCreateOfficialLogs(id), body)

const submitReview = (id, body) =>
  http.post(apiSubmitStageReview(id), body)

const approveReview = (id, body) =>
  http.post(apiApproveStageReview(id), body)

const rejectReview = (id, body) =>
  http.post(apiRejectStageReview(id), body)

const CultivationStageService = {
  getAll,
  getById,
  getByLogbookId,
  getStageLogs,
  getSummary,
  createOfficialLogs,
  submitReview,
  approveReview,
  rejectReview,
  create,
  update,
  deleteById,
}

export default CultivationStageService
