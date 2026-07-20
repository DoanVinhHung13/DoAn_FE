import http from '../01_axios'
import {
  apiGetCultivationStages,
  apiCreateCultivationStage,
  apiGetCultivationStageById,
  apiUpdateCultivationStage,
  apiDeleteCultivationStage,
  apiGetStagesByLogbook,
  apiGetCultivationStageLogs,
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

const getStageLogs = (stageId) => {
  return http.get(apiGetCultivationStageLogs(stageId))
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

const CultivationStageService = {
  getAll,
  getById,
  getByLogbookId,
  getStageLogs,
  create,
  update,
  deleteById,
}

export default CultivationStageService
