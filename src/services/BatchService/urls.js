// API endpoints for Batch (Harvest Batch) management
const BASE_URL = '/harvest-batches';

export const apiGetBatches = `${BASE_URL}`;
export const apiGetBatchById = (id) => `${BASE_URL}/${id}`;
export const apiCreateBatch = `${BASE_URL}`;
export const apiUpdateBatch = (id) => `${BASE_URL}/${id}`;
export const apiDeleteBatch = (id) => `${BASE_URL}/${id}`;
export const apiActivateBatch = (id) => `${BASE_URL}/${id}/activate`;
export const apiDeactivateBatch = (id) => `${BASE_URL}/${id}/deactivate`;
