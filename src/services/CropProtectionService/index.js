import http from '../01_axios'
import {
  apiGetCropProtections,
  apiCreateCropProtection,
  apiGetCropProtectionById,
  apiUpdateCropProtection,
  apiDeleteCropProtection,
  apiToggleCropProtectionStatus,
} from './urls'

const getCropProtections = (params) => http.get(apiGetCropProtections, { params })

const getCropProtectionById = (id) => http.get(apiGetCropProtectionById(id))

const createCropProtection = (body) => http.post(apiCreateCropProtection, body)

const updateCropProtection = (id, body) => http.put(apiUpdateCropProtection(id), body)

const deleteCropProtection = (id) => http.delete(apiDeleteCropProtection(id))

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
