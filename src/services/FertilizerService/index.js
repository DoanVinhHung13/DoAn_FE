/**
 * fertilizerService — Tất cả API thuộc nhóm /api/fertilizers/*
 * Swagger: https://api.eapls.io.vn/swagger/index.html → nhóm "Fertilizers"
 *
 * GET    /api/fertilizers              → getFertilizers(params)
 * POST   /api/fertilizers              → createFertilizer(body)
 * GET    /api/fertilizers/{id}         → getFertilizerById(id)
 * PUT    /api/fertilizers/{id}         → updateFertilizer(id, body)
 * DELETE /api/fertilizers/{id}         → deleteFertilizer(id)
 * PUT    /api/fertilizers/{id}         → toggleFertilizerStatus(id, body) — { isActive }
 *
 * CreateFertilizerRequest / UpdateFertilizerRequest schema:
 *   { name: string (req), code: string (req), unit: string (req),
 *     manufacturer?: string, description?: string, minimumStock?: number,
 *     type?: string,
 *     compositions?: Array<{ name: string, value: string, unit: string }>,
 *     dosages?: Array<{ amount: string, unit: string, areaUnit: string, target: string }> }
 */
import http from '../01_axios'
import {
  apiGetFertilizers,
  apiCreateFertilizer,
  apiGetFertilizerById,
  apiUpdateFertilizer,
  apiDeleteFertilizer,
  apiToggleFertilizerStatus,
  apiDeactivateFertilizer,
  apiReactivateFertilizer,
  apiGetFertilizerSelection,
} from './urls'

/**
 * GET /api/fertilizers
 * params: { PageIndex, PageSize, SearchKeyword, Type?, Status? }
 */
const getFertilizers = (params) => http.get(apiGetFertilizers, { params })

/**
 * GET /api/fertilizers/:id
 */
const getFertilizerById = (id) => http.get(apiGetFertilizerById(id))

/**
 * POST /api/fertilizers
 * body: { name, unit, manufacturer?,
 *         description?, minimumStock?, type?, compositions?, dosages? }
 */
const createFertilizer = (body, config) => http.post(apiCreateFertilizer, body, config)

/**
 * PUT /api/fertilizers/:id
 * body: { name, unit, manufacturer?,
 *         description?, minimumStock?, type?, compositions?, dosages? }
 */
const updateFertilizer = (id, body, config) => http.put(apiUpdateFertilizer(id), body, config)

/**
 * DELETE /api/fertilizers/:id — xóa mềm
 */
const deleteFertilizer = (id) => http.delete(apiDeleteFertilizer(id))

/**
 * PUT /api/fertilizers/:id — thay đổi trạng thái (isActive)
 * body: { isActive: boolean }
 * NOTE: Swagger không có endpoint riêng cho status —
 *       dùng chung PUT với toàn bộ body update + trường isActive.
 */
const toggleFertilizerStatus = (id) => http.patch(apiToggleFertilizerStatus(id))
const deactivateFertilizer = (id) => toggleFertilizerStatus(id)
const reactivateFertilizer = (id) => toggleFertilizerStatus(id)

/** GET /fertilizers/selection — dùng cho Daily Log Select */
const getFertilizerSelection = (params) =>
  http.get(apiGetFertilizerSelection, { params, skipNotice: true })

const FertilizerService = {
  getFertilizers,
  getFertilizerById,
  createFertilizer,
  updateFertilizer,
  deleteFertilizer,
  toggleFertilizerStatus,
  deactivateFertilizer,
  reactivateFertilizer,
  getFertilizerSelection,
}

export default FertilizerService
