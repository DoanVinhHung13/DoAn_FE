import http from "../01_axios"
import { apiUploadImage, apiUploadDocument, apiUploadAvatar } from "./urls"

const uploadImage = (formData, options = {}) =>
  http.post(apiUploadImage, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    ...options,
  })

const uploadDocument = (formData, options = {}) =>
  http.post(apiUploadDocument, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    ...options,
  })

const uploadAvatar = (formData, options = {}) =>
  http.post(apiUploadAvatar, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    ...options,
  })

const UploadService = {
  uploadImage,
  uploadDocument,
  uploadAvatar,
}

export default UploadService
