import http from "../01_axios"
import {
  apiGetBatches,
  apiGetBatchById,
  apiGetBatchTraceability,
  apiCreateBatch,
  apiUpdateBatch,
  apiDeleteBatch,
  apiActivateBatch,
  apiDeactivateBatch,
} from "./urls"

export const getHarvestBatches = (params, config = {}) =>
  http.get(apiGetBatches, { params, ...config })
export const getHarvestBatchById = (id, config = {}) =>
  http.get(apiGetBatchById(id), config)
export const getHarvestBatchTraceability = (id, config = {}) =>
  http.get(apiGetBatchTraceability(id), {
    skipNotice: true,
    skipAuthRedirect: true,
    ...config,
  })
export const createHarvestBatch = data => http.post(apiCreateBatch, data)
export const updateHarvestBatch = (id, data) =>
  http.put(apiUpdateBatch(id), data)
export const deleteHarvestBatch = id => http.delete(apiDeleteBatch(id))
export const activateHarvestBatch = id => http.post(apiActivateBatch(id))
export const deactivateHarvestBatch = id => http.post(apiDeactivateBatch(id))

const HarvestBatchService = {
  getHarvestBatches,
  getHarvestBatchById,
  getHarvestBatchTraceability,
  createHarvestBatch,
  updateHarvestBatch,
  deleteHarvestBatch,
  activateHarvestBatch,
  deactivateHarvestBatch,
}

export default HarvestBatchService
