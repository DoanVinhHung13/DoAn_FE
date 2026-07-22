import http from '../01_axios'
import {
  apiGetLandPlots,
  apiCreateLandPlot,
  apiGetLandPlotById,
  apiUpdateLandPlot,

  apiActivateLandPlot,
  apiDeactivateLandPlot,
  apiGetLandPlotsAvailableForLogbook,
} from './urls'

const getLandPlots = (params) => http.get(apiGetLandPlots, { params })
const getLandPlotById = (id) => http.get(apiGetLandPlotById(id))
const createLandPlot = (body) => http.post(apiCreateLandPlot, body)
const updateLandPlot = (id, body) => http.put(apiUpdateLandPlot(id), body)

const activateLandPlot = (id) => http.post(apiActivateLandPlot(id))
const deactivateLandPlot = (id) => http.post(apiDeactivateLandPlot(id))

const getAvailableForLogbook = (params) =>
  http.get(apiGetLandPlotsAvailableForLogbook, { params, skipNotice: true })

const LandPlotService = {
  getLandPlots,
  getLandPlotById,
  createLandPlot,
  updateLandPlot,

  activateLandPlot,
  deactivateLandPlot,
  getAvailableForLogbook,
}

export default LandPlotService
