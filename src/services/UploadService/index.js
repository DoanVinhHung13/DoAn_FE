import http from '../01_axios'
import { apiUploadImage, apiUploadDocument, apiUploadAvatar } from './urls'

const uploadImage = (formData) => http.post(apiUploadImage, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})

const uploadDocument = (formData) => http.post(apiUploadDocument, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})

const uploadAvatar = (formData) => http.post(apiUploadAvatar, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})

const UploadService = {
  uploadImage,
  uploadDocument,
  uploadAvatar,
}

export default UploadService
