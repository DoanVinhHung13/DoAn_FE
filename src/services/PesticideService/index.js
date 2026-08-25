/**
 * PesticideService — nông dược
 * Swagger: /api/pesticides
 */
import http from "../01_axios"
import {
  apiGetPesticides,
  apiCreatePesticide,
  apiGetPesticideById,
  apiUpdatePesticide,
  apiDeletePesticide,
  apiTogglePesticideStatus,
  apiDeactivatePesticide,
  apiReactivatePesticide,
  apiGetPesticideSelection,
} from "./urls"

const silentConfig = { skipNotice: true }

const getPesticides = params =>
  http.get(apiGetPesticides, { params, ...silentConfig })

const getPesticideById = id => http.get(apiGetPesticideById(id), silentConfig)

const createPesticide = (body, config) =>
  http.post(apiCreatePesticide, body, config)

const updatePesticide = (id, body, config) =>
  http.put(apiUpdatePesticide(id), body, config)

const deletePesticide = id => http.delete(apiDeletePesticide(id))

const togglePesticideStatus = (id, body) =>
  http.patch(apiTogglePesticideStatus(id), body)
const deactivatePesticide = id => togglePesticideStatus(id)
const reactivatePesticide = id => togglePesticideStatus(id)

/** GET /pesticides/selection — dùng cho Daily Log Select */
const getPesticideSelection = params =>
  http.get(apiGetPesticideSelection, { params, ...silentConfig })

const PesticideService = {
  getPesticides,
  getPesticideById,
  createPesticide,
  updatePesticide,
  deletePesticide,
  togglePesticideStatus,
  deactivatePesticide,
  reactivatePesticide,
  getPesticideSelection,
}

export default PesticideService
