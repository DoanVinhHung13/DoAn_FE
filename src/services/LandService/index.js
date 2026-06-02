import http from '../01_axios'
import {
  apiGetLands,
  apiGetLandById,
  apiCreateLand,
  apiUpdateLand,
  apiDeleteLand,
  apiChangeLandStatus,
  apiGetLandsByArea,
  apiGetLandStats,
  apiGetLandGeoJson,
} from './urls'

const getLands = (params) => http.get(apiGetLands, { params })
const getLandById = (id) => http.get(apiGetLandById(id))
const createLand = (body) => http.post(apiCreateLand, body)
const updateLand = (id, body) => http.put(apiUpdateLand(id), body)
const deleteLand = (id) => http.delete(apiDeleteLand(id))
const changeLandStatus = (id, body) => http.patch(apiChangeLandStatus(id), body)
const getLandsByArea = (areaId) => http.get(apiGetLandsByArea(areaId))
const getLandStats = () => http.get(apiGetLandStats)
const getLandGeoJson = (id) => http.get(apiGetLandGeoJson(id))

const LandService = {
  getLands,
  getLandById,
  createLand,
  updateLand,
  deleteLand,
  changeLandStatus,
  getLandsByArea,
  getLandStats,
  getLandGeoJson,
}

export default LandService
