// HarvestBatches API endpoints
// Swagger: /api/harvest-batches
// Doc ghi product-batches — FE dùng harvest-batches theo Swagger

export const apiGetHarvestBatches = '/harvest-batches'
export const apiCreateHarvestBatch = '/harvest-batches'
export const apiGetHarvestBatchById = (id) => `/harvest-batches/${id}`
export const apiUpdateHarvestBatch = (id) => `/harvest-batches/${id}`
export const apiDeleteHarvestBatch = (id) => `/harvest-batches/${id}`
export const apiGetHarvestBatchTraceability = (id) => `/harvest-batches/${id}/traceability`
