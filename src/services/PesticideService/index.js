/**
 * PesticideService — nông dược
 * Swagger: /api/pesticides
 */
import http from '../01_axios'
import {
  apiGetPesticides,
  apiCreatePesticide,
  apiGetPesticideById,
  apiUpdatePesticide,
  apiDeletePesticide,
  apiTogglePesticideStatus,
  apiGetPesticideSelection,
} from './urls'

const silentConfig = { skipNotice: true }

const getAll = (params) => http.get(apiGetPesticides, { params, ...silentConfig })

const getById = (id) => http.get(apiGetPesticideById(id), silentConfig)

const create = (body) => http.post(apiCreatePesticide, body)

const update = (id, body) => http.put(apiUpdatePesticide(id), body)

const remove = (id) => http.delete(apiDeletePesticide(id))

const toggleStatus = (id, body) => http.patch(apiTogglePesticideStatus(id), body)

/** GET /pesticides/selection — dùng cho Daily Log Select */
const getSelection = (params) =>
  http.get(apiGetPesticideSelection, { params, ...silentConfig })

const PesticideService = {
  getAll,
  getById,
  create,
  update,
  remove,
  toggleStatus,
  getSelection,
}

export default PesticideService
