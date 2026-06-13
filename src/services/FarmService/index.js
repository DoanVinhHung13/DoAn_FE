import http from '../01_axios'
import { apiGetFarms, apiGetFarmById } from './urls'

const getFarms = (params) => http.get(apiGetFarms, { params })
const getFarmById = (id) => http.get(apiGetFarmById(id))

const FarmService = {
  getFarms,
  getFarmById,
}

export default FarmService
