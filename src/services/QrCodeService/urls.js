// QrCodes API endpoints — bước 6 luồng chính
// Swagger: POST /api/qr-codes/generate/{harvestBatchId}
//          GET  /api/qr-codes/{traceCode}/image

export const apiGenerateQrCode = (harvestBatchId) => `/qr-codes/generate/${harvestBatchId}`
export const apiGetQrCodeImage = (traceCode) => `/qr-codes/${traceCode}/image`
export const apiGetQrCodeById = (id) => `/qr-codes/${id}`
export const apiGetQrCodes = '/qr-codes'
export const apiPreviewQrCode = '/qr-codes/preview'
export const apiCreateQrCode = '/qr-codes'
export const apiUpdateQrCode = (id) => `/qr-codes/${id}`
export const apiDeleteQrCode = (id) => `/qr-codes/${id}`
export const apiDownloadQrCode = (id) => `/qr-codes/${id}/download`
export const apiGetQrStats = '/qr-codes/stats'
