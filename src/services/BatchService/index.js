import http from '../01_axios';
import {
  apiGetBatches,
  apiGetBatchById,
  apiCreateBatch,
  apiUpdateBatch,
  apiDeleteBatch,
  apiActivateBatch,
  apiDeactivateBatch,
} from './urls';

export const getBatches = (params) => http.get(apiGetBatches, { params });
export const getBatchById = (id) => http.get(apiGetBatchById(id));
export const createBatch = (data) => http.post(apiCreateBatch, data);
export const updateBatch = (id, data) => http.put(apiUpdateBatch(id), data);
export const deleteBatch = (id) => http.delete(apiDeleteBatch(id));
export const activateBatch = (id) => http.post(apiActivateBatch(id));
export const deactivateBatch = (id) => http.post(apiDeactivateBatch(id));

const BatchService = {
  getBatches,
  getBatchById,
  createBatch,
  updateBatch,
  deleteBatch,
  activateBatch,
  deactivateBatch,
};

export default BatchService;
