import http from '../01_axios';
import {
  apiGetBatches,
  apiGetBatchById,
  apiGetBatchTraceability,
  apiCreateBatch,
  apiUpdateBatch,
  apiDeleteBatch,
  apiActivateBatch,
  apiDeactivateBatch,
} from './urls';

export const getBatches = (params, config = {}) => http.get(apiGetBatches, { params, ...config });
export const getBatchById = (id, config = {}) => http.get(apiGetBatchById(id), config);
export const getBatchTraceability = (id, config = {}) => http.get(apiGetBatchTraceability(id), { skipNotice: true, skipAuthRedirect: true, ...config });
export const createBatch = (data) => http.post(apiCreateBatch, data);
export const updateBatch = (id, data) => http.put(apiUpdateBatch(id), data);
export const deleteBatch = (id) => http.delete(apiDeleteBatch(id));
export const activateBatch = (id) => http.post(apiActivateBatch(id));
export const deactivateBatch = (id) => http.post(apiDeactivateBatch(id));

const BatchService = {
  getBatches,
  getBatchById,
  getBatchTraceability,
  createBatch,
  updateBatch,
  deleteBatch,
  activateBatch,
  deactivateBatch,
};

export default BatchService;
