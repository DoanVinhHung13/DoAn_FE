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
} from './urls'

const silentConfig = { skipNotice: true }

const getAll = (params) => http.get(apiGetQrCodes, { params, ...silentConfig })

const getById = (id) => http.get(apiGetQrCodeById(id), silentConfig)

const generate = (harvestBatchId) => http.post(apiGenerateQrCode(harvestBatchId))

/** GET ảnh PNG theo traceCode — responseType blob nếu cần tải file */
const getImage = (traceCode, config = {}) =>
  http.get(apiGetQrCodeImage(traceCode), { ...silentConfig, ...config })

const QrCodeService = {
  getAll,
  getById,
  generate,
  getImage,
}

export default QrCodeService
