import http from '../01_axios'
import {
  apiGetLandPlots,
  apiCreateLandPlot,
  apiGetLandPlotById,
  apiGetLandPlotWeather,
  apiUpdateLandPlot,
  apiDeleteLandPlot,

  apiActivateLandPlot,
  apiDeactivateLandPlot,
  apiReactivateLandPlot,
  apiGetLandPlotsAvailableForLogbook,
} from './urls'

const getLandPlots = (params) => http.get(apiGetLandPlots, { params })
const getLandPlotById = (id) => http.get(apiGetLandPlotById(id))
const getLandPlotWeather = (id) => http.get(apiGetLandPlotWeather(id), { skipNotice: true })
const createLandPlot = (body) => http.post(apiCreateLandPlot, body)
const updateLandPlot = (id, body) => http.put(apiUpdateLandPlot(id), body)
const deleteLandPlot = (id) => http.delete(apiDeleteLandPlot(id))

const activateLandPlot = (id) => http.post(apiActivateLandPlot(id))
const deactivateLandPlot = (id) => http.post(apiDeactivateLandPlot(id))
const reactivateLandPlot = (id) => http.post(apiReactivateLandPlot(id))

const getAvailableForLogbook = (params) =>
  http.get(apiGetLandPlotsAvailableForLogbook, { params, skipNotice: true })

const LandPlotService = {
  getLandPlots,
  getLandPlotById,
  getLandPlotWeather,
  createLandPlot,
  updateLandPlot,
  deleteLandPlot,

  activateLandPlot,
  deactivateLandPlot,
  reactivateLandPlot,
  getAvailableForLogbook,
}

export default LandPlotService
