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

const getPesticides = (params) => http.get(apiGetPesticides, { params, ...silentConfig })

const getPesticideById = (id) => http.get(apiGetPesticideById(id), silentConfig)

const createPesticide = (body) => http.post(apiCreatePesticide, body)

const updatePesticide = (id, body) => http.put(apiUpdatePesticide(id), body)

const deletePesticide = (id) => http.delete(apiDeletePesticide(id))

const togglePesticideStatus = (id, body) => http.patch(apiTogglePesticideStatus(id), body)

/** GET /pesticides/selection — dùng cho Daily Log Select */
const getPesticideSelection = (params) =>
  http.get(apiGetPesticideSelection, { params, ...silentConfig })

const PesticideService = {
  getPesticides,
  getPesticideById,
  createPesticide,
  updatePesticide,
  deletePesticide,
  togglePesticideStatus,
  getPesticideSelection,
}

export default PesticideService
