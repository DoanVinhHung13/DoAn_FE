import http from "../01_axios"
import {
  apiGetCropVarieties,
  apiGetCropVarietyById,
  apiCreateCropVariety,
  apiUpdateCropVariety,
  apiDeleteCropVariety,
} from "./urls"

export const getCropVarieties = params =>
  http.get(apiGetCropVarieties, { params })
export const getCropVarietyById = id => http.get(apiGetCropVarietyById(id))
export const createCropVariety = data => http.post(apiCreateCropVariety, data)
export const updateCropVariety = (id, data) =>
  http.put(apiUpdateCropVariety(id), data)
export const deleteCropVariety = id => http.delete(apiDeleteCropVariety(id))

const CropVarietyService = {
  getCropVarieties,
  getCropVarietyById,
  createCropVariety,
  updateCropVariety,
  deleteCropVariety,
}

export default CropVarietyService
