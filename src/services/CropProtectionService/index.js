/**
 * CropProtectionService — API thuốc bảo vệ thực vật
 * Swagger: https://api.eapls.io.vn/swagger/index.html → nhóm "CropProtection"
 *
 * GET    /api/crop-protection              → getCropProtections(params)
 * POST   /api/crop-protection              → createCropProtection(body)
 * GET    /api/crop-protection/{id}         → getCropProtectionById(id)
 * PUT    /api/crop-protection/{id}         → updateCropProtection(id, body)
 * DELETE /api/crop-protection/{id}         → deleteCropProtection(id)
 * PATCH  /api/crop-protection/{id}/status  → toggleCropProtectionStatus(id, body)
 *
 * CreateCropProtectionRequest / UpdateCropProtectionRequest schema:
 *   { name: string (req), code: string (req),
 *     manufacturer?: string, supplier?: string,
 *     minInventory: number (min 0), unit?: string,
 *     description?: string, isActive: boolean,
 *     usages?: Array<{
 *       targetCrop?: string, targetPest?: string,
 *       concentration?: string, concentrationUnit?: string,
 *       dilutionVolume?: string, dilutionUnit?: string,
 *       dosage: number, dosageUnit?: string,
 *       area: number, areaUnit?: string,
 *       quarantineDays?: int
 *     }> }
 */
import http from '../01_axios'
import {
  apiGetCropProtections,
  apiCreateCropProtection,
  apiGetCropProtectionById,
  apiUpdateCropProtection,
  apiDeleteCropProtection,
  apiToggleCropProtectionStatus,
} from './urls'

/**
 * GET /api/crop-protection
 * params: { PageIndex, PageSize, SearchKeyword, Status? }
 */
const getCropProtections = (params) => http.get(apiGetCropProtections, { params })

/**
 * GET /api/crop-protection/{id}
 */
const getCropProtectionById = (id) => http.get(apiGetCropProtectionById(id))

/**
 * POST /api/crop-protection
 * body: { name, code, manufacturer?, supplier?, minInventory, unit?, description?, isActive, usages? }
 */
const createCropProtection = (body) => http.post(apiCreateCropProtection, body)

/**
 * PUT /api/crop-protection/{id}
 * body: { name, code, manufacturer?, supplier?, minInventory, unit?, description?, isActive, usages? }
 */
const updateCropProtection = (id, body) => http.put(apiUpdateCropProtection(id), body)

/**
 * DELETE /api/crop-protection/{id}
 */
const deleteCropProtection = (id) => http.delete(apiDeleteCropProtection(id))

/**
 * PATCH /api/crop-protection/{id}/status
 * body: { isActive: boolean }
 */
const toggleCropProtectionStatus = (id, body) => http.patch(apiToggleCropProtectionStatus(id), body)

const CropProtectionService = {
  getCropProtections,
  getCropProtectionById,
  createCropProtection,
  updateCropProtection,
  deleteCropProtection,
  toggleCropProtectionStatus,
}

export default CropProtectionService
