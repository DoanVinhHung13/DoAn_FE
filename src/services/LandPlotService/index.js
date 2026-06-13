import http from '../01_axios'
import {
  apiGetLandPlots,
  apiCreateLandPlot,
  apiGetLandPlotById,
  apiUpdateLandPlot,
  apiAssignLandManager,
  apiRemoveLandManager,
  apiActivateLandPlot,
  apiDeactivateLandPlot,
} from './urls'

const getLandPlots = (params) => http.get(apiGetLandPlots, { params })
const getLandPlotById = (id) => http.get(apiGetLandPlotById(id))
const createLandPlot = (body) => http.post(apiCreateLandPlot, body)
const updateLandPlot = (id, body) => http.put(apiUpdateLandPlot(id), body)
const assignLandManager = (id, body) => http.post(apiAssignLandManager(id), body)
const removeLandManager = (id, landManagerId) =>
  http.delete(apiRemoveLandManager(id, landManagerId))
const activateLandPlot = (id) => http.post(apiActivateLandPlot(id))
const deactivateLandPlot = (id) => http.post(apiDeactivateLandPlot(id))

const LandPlotService = {
  getLandPlots,
  getLandPlotById,
  createLandPlot,
  updateLandPlot,
  assignLandManager,
  removeLandManager,
  activateLandPlot,
  deactivateLandPlot,
}

export default LandPlotService
