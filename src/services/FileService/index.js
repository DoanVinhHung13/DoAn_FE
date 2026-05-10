import http from "../01_axios"
import { apiUploadFile, apiUploadFileList } from "./urls"

const uploadFile = body => http.post(apiUploadFile, body)
const uploadFileList = body => http.post(apiUploadFileList, body)

const FileService = { uploadFileList, uploadFile }
export default FileService