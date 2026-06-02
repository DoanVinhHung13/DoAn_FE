import http from '../01_axios'
import {
  apiGetProfile,
  apiGetHtxList,
  apiGetSupplyRequests,
  apiCreateSupplyRequest,
  apiDeleteSupplyRequest,
} from './urls'

const getProfile = () => http.get(apiGetProfile)
const getHtxList = () => http.get(apiGetHtxList)
const getSupplyRequests = (params) => http.get(apiGetSupplyRequests, { params })
const createSupplyRequest = (body) => http.post(apiCreateSupplyRequest, body)
const deleteSupplyRequest = (id) => http.delete(apiDeleteSupplyRequest(id))

const FarmerSupplyService = {
  getProfile,
  getHtxList,
  getSupplyRequests,
  createSupplyRequest,
  deleteSupplyRequest,
}

export default FarmerSupplyService
