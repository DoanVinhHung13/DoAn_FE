/**
 * HarvestBatchService — lô thu hoạch (bước 6 Tạo QR)
 * Swagger: /api/harvest-batches
 *
 * CreateHarvestBatchRequest:
 *   { productId, cultivationLogbookId, batchCode, unit, quantity?, expiryDate?, status? }
 */
import http from '../01_axios'
import {
  apiGetHarvestBatches,
  apiCreateHarvestBatch,
  apiGetHarvestBatchById,
  apiUpdateHarvestBatch,
  apiDeleteHarvestBatch,
  apiGetHarvestBatchTraceability,
} from './urls'

const silentConfig = { skipNotice: true }

const getAll = (params) => http.get(apiGetHarvestBatches, { params, ...silentConfig })

const getById = (id) => http.get(apiGetHarvestBatchById(id), silentConfig)

const create = (body) => http.post(apiCreateHarvestBatch, body)

const update = (id, body) => http.put(apiUpdateHarvestBatch(id), body)

const remove = (id) => http.delete(apiDeleteHarvestBatch(id))

const getTraceability = (id) =>
  http.get(apiGetHarvestBatchTraceability(id), silentConfig)

const HarvestBatchService = {
  getAll,
  getById,
  create,
  update,
  remove,
  getTraceability,
}

export default HarvestBatchService
