import http from '../01_axios'
import {
  apiGetCultivationLogbooks,
  apiCreateCultivationLogbook,
  apiGetCultivationLogbookById,
  apiUpdateCultivationLogbook,
  apiDeleteCultivationLogbook,
  apiSubmitCompletion,
  apiApproveCompletion,
  apiRejectCompletion,
  apiPlanLogbook,
  apiStartLogbook,
  apiCompleteLogbook,
  apiGetClosingReviews,
} from './urls'

const getAll = (params, config = {}) => {
  return http.get(apiGetCultivationLogbooks, { ...config, params })
}

const getById = (id, config = {}) => {
  return http.get(apiGetCultivationLogbookById(id), config)
}

const create = (body, config) => {
  return http.post(apiCreateCultivationLogbook, body, config)
}

const update = (id, body, config) =>
  http.put(apiUpdateCultivationLogbook(id), body, config)

const deleteById = (id) =>
  http.delete(apiDeleteCultivationLogbook(id))

const submitCompletion = (id) =>
  http.post(apiSubmitCompletion(id))

const approveCompletion = (id, body) =>
  http.post(apiApproveCompletion(id), body, {
    headers: { 'Content-Type': 'application/json' },
  })

const rejectCompletion = (id, body) =>
  http.post(apiRejectCompletion(id), body)

const plan = (id) =>
  http.post(apiPlanLogbook(id))

const start = (id) =>
  http.post(apiStartLogbook(id))

const complete = (id) =>
  http.post(apiCompleteLogbook(id))

const getClosingReviews = (params) =>
  http.get(apiGetClosingReviews, { params, skipNotice: true })

const CultivationLogbookService = {
  getAll,
  getById,
  create,
  update,
  deleteById,
  submitCompletion,
  approveCompletion,
  rejectCompletion,
  plan,
  start,
  complete,
  getClosingReviews,
}

export default CultivationLogbookService
