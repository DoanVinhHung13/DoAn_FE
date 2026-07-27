import http from '../01_axios'
import {
  apiGetQRCodes,
  apiGetQRCodeById,
  apiPreviewQRCode,
  apiCreateQRCode,
  apiUpdateQRCode,
  apiDeleteQRCode,
  apiDownloadQRCode,
  apiGetQRStats,
} from './urls'

export const getQRCodes = params => http.get(apiGetQRCodes, { params })
export const getQRCodeById = id => http.get(apiGetQRCodeById(id))
export const previewQRCode = data =>
  http.post(apiPreviewQRCode, data, { skipNotice: true })
export const createQRCode = data => http.post(apiCreateQRCode, data)
export const updateQRCode = (id, data) => http.put(apiUpdateQRCode(id), data)
export const deleteQRCode = id => http.delete(apiDeleteQRCode(id))
export const downloadQRCode = id => http.get(apiDownloadQRCode(id), { responseType: 'blob' })
export const getQRStats = () => http.get(apiGetQRStats)

const QRService = {
  getQRCodes,
  getQRCodeById,
  previewQRCode,
  createQRCode,
  updateQRCode,
  deleteQRCode,
  downloadQRCode,
  getQRStats,
}

export default QRService
