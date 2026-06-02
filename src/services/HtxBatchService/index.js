import http from '../01_axios'
import {
  apiGetBatches,
  apiCreateBatch,
  apiGetBatchById,
  apiSyncBatchPortal,
  apiGetBatchSyncHistory,
  apiGetProducts,
  apiGetHtxJournals,
} from './urls'

const getBatches = (params) => http.get(apiGetBatches, { params })
const createBatch = (body) => http.post(apiCreateBatch, body)
const getBatchById = (id) => http.get(apiGetBatchById(id))
const syncBatchPortal = (id) => http.post(apiSyncBatchPortal(id))
const getBatchSyncHistory = (id) => http.get(apiGetBatchSyncHistory(id))

const getProducts = (params) => http.get(apiGetProducts, { params })
const getHtxJournals = (params) => http.get(apiGetHtxJournals, { params })

const HtxBatchService = {
  getBatches,
  createBatch,
  getBatchById,
  syncBatchPortal,
  getBatchSyncHistory,
  getProducts,
  getHtxJournals,
}

export default HtxBatchService
