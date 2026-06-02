import http from '../01_axios'
import {
  apiGetSupplyRequests,
  apiUpdateSupplyRequestStatus,
  apiGetInventory,
} from './urls'

const getSupplyRequests = (params) => http.get(apiGetSupplyRequests, { params })
const updateSupplyRequestStatus = (id, body) => http.put(apiUpdateSupplyRequestStatus(id), body)
const getInventory = (params) => http.get(apiGetInventory, { params })

const HtxSupplyService = {
  getSupplyRequests,
  updateSupplyRequestStatus,
  getInventory,
}

export default HtxSupplyService
