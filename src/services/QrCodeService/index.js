/**
 * QrCodeService — tạo / lấy ảnh QR (bước 6)
 * Swagger: /api/qr-codes
 */
import http from '../01_axios'
import {
  apiGenerateQrCode,
  apiGetQrCodeImage,
  apiGetQrCodeById,
  apiGetQrCodes,
  apiPreviewQrCode,
  apiCreateQrCode,
  apiUpdateQrCode,
  apiDeleteQrCode,
  apiDownloadQrCode,
  apiGetQrStats,
} from './urls'

const silentConfig = { skipNotice: true }

const getQrCodes = (params) => http.get(apiGetQrCodes, { params, ...silentConfig })

const getQrCodeById = (id) => http.get(apiGetQrCodeById(id), silentConfig)

const generateQrCode = (harvestBatchId) => http.post(apiGenerateQrCode(harvestBatchId))

/** GET ảnh PNG theo traceCode — responseType blob nếu cần tải file */
const getQrCodeImage = (traceCode, config = {}) =>
  http.get(apiGetQrCodeImage(traceCode), { ...silentConfig, ...config })

const previewQrCode = (data) =>
  http.post(apiPreviewQrCode, data, { skipNotice: true })

const createQrCode = (data) => http.post(apiCreateQrCode, data)
const updateQrCode = (id, data) => http.put(apiUpdateQrCode(id), data)
const deleteQrCode = (id) => http.delete(apiDeleteQrCode(id))
const downloadQrCode = (id) =>
  http.get(apiDownloadQrCode(id), { responseType: 'blob' })
const getQrStats = () => http.get(apiGetQrStats)

const QrCodeService = {
  getQrCodes,
  getQrCodeById,
  generateQrCode,
  getQrCodeImage,
  previewQrCode,
  createQrCode,
  updateQrCode,
  deleteQrCode,
  downloadQrCode,
  getQrStats,
}

export default QrCodeService
