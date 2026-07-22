import http from '../01_axios'
import {
  apiGetCultivationLogbooks,
  apiCreateCultivationLogbook,
  apiGetCultivationLogbookById,
  apiUpdateCultivationLogbook,
  apiDeleteCultivationLogbook,
  apiSubmitReview,
  apiApproveReview,
  apiRejectReview,
  apiSubmitCompletion,
  apiApproveCompletion,
  apiRejectCompletion,
  apiPlanLogbook,
  apiStartLogbook,
  apiCompleteLogbook,
  apiCancelLogbook,
  apiGetClosingReviews,
} from './urls'

const getAll = (params) => {
  return http.get(apiGetCultivationLogbooks, { params })
}

const getById = (id) => {
  return http.get(apiGetCultivationLogbookById(id))
}

const create = (body, config) => {
  return http.post(apiCreateCultivationLogbook, body, config)
}

const update = (id, body, config) =>
  http.put(apiUpdateCultivationLogbook(id), body, config)

const deleteById = (id) =>
  http.delete(apiDeleteCultivationLogbook(id))

// Workflow actions
const submitReview = (id) =>
  http.post(apiSubmitReview(id))

const approveReview = (id) =>
  http.post(apiApproveReview(id))

const rejectReview = (id, body) =>
  http.post(apiRejectReview(id), body)

const submitCompletion = (id) =>
  http.post(apiSubmitCompletion(id))

const approveCompletion = (id) =>
  http.post(apiApproveCompletion(id))

const rejectCompletion = (id, body) =>
  http.post(apiRejectCompletion(id), body)

const plan = (id) =>
  http.post(apiPlanLogbook(id))

const start = (id) =>
  http.post(apiStartLogbook(id))

const complete = (id) =>
  http.post(apiCompleteLogbook(id))

const cancel = (id) =>
  http.post(apiCancelLogbook(id))

const getClosingReviews = (params) =>
  http.get(apiGetClosingReviews, { params, skipNotice: true })

const CultivationLogbookService = {
  getAll,
  getById,
  create,
  update,
  deleteById,
  submitReview,
  approveReview,
  rejectReview,
  submitCompletion,
  approveCompletion,
  rejectCompletion,
  plan,
  start,
  complete,
  cancel,
  getClosingReviews,
}

export default CultivationLogbookService
