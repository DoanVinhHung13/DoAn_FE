// QrCodes API endpoints — bước 6 luồng chính
// Swagger: POST /api/qr-codes/generate/{harvestBatchId}
//          GET  /api/qr-codes/{traceCode}/image

export const apiGenerateQrCode = (harvestBatchId) => `/qr-codes/generate/${harvestBatchId}`
export const apiGetQrCodeImage = (traceCode) => `/qr-codes/${traceCode}/image`
export const apiGetQrCodeById = (id) => `/qr-codes/${id}`
export const apiGetQrCodes = '/qr-codes'
