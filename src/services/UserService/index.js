import QueryString from "qs"
import http from "../01_axios"
import {
  apiChangeImgUser,
  apiChangeInfor,
  apiDeleteUser,
  apiDetailUser,
  apiExportGuest,
  apiExportUser,
  apiGetAccount,
  apiGetInforUser,
  apiGetListGuest,
  apiGetListUser,
  apiGetListUserInDept,
  apiGetTemplateFileImportGuest,
  apiGetTemplateFileImportUser,
  apiImportGuest,
  apiImportUser,
  apiInsertUser,
  apiReplacePassword,
  apiResetPassword,
  apiUpdateAccount,
  apiUpdateUser,
  apiQRAccount,
  apiQRScan,
} from "./urls"

const generatQRAccount = body => {
  // body sẽ chứa { UserID: userID }
  return http.post(apiQRAccount, body, {
    headers: {
      Authorization: "adminadmin", // Thêm header Authorization trực tiếp
    },
    responseType: "blob", // Yêu cầu trả về dữ liệu nhị phân (Blob)
  })
}

const scanQRAccount = file => {
  const formData = new FormData()
  formData.append("file", file)

  return http.post(apiQRScan, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    responseType: "json",
  })
}

const updateAccount = body => http.post(apiUpdateAccount, body)
const getAccount = params =>
  http.get(apiGetAccount, {
    params,
  })
const insertUser = body => http.post(apiInsertUser, body)
const deleteUser = UserID => http.patch(`${apiDeleteUser}?UserID=${UserID}`)
const detailUser = params =>
  http.get(apiDetailUser, {
    params,
  })
const updateUser = params => http.post(apiUpdateUser, params)
const importUser = body => http.post(apiImportUser, body)
const getTemplateFileImportUser = body =>
  http.get(apiGetTemplateFileImportUser, body)
const exportUser = params => {
  http.interceptors.request.use(
    async config => {
      config.responseType = "blob"
      return config
    },
    error => Promise.reject(error),
  )
  return http.get(apiExportUser, {
    params,
  })
}
const importGuest = body => http.post(apiImportGuest, body)
const exportGuest = params =>
  http.get(apiExportGuest, {
    params,
  })
const templateImportGuest = () => {
  http.interceptors.request.use(
    async config => {
      config.responseType = "blob"
      return config
    },
    error => Promise.reject(error),
  )
  return http.get(apiGetTemplateFileImportGuest)
}
const getListUser = body => http.post(apiGetListUser, body)
const GetListGuest = params => http.post(apiGetListGuest, params)
const replacePassword = params => http.post(apiReplacePassword, params)
const getInforUser = () => http.get(apiGetInforUser)
const changeInfor = body => http.post(apiChangeInfor, body)
const changeAvatar = avatarUrl => {
  const url = `${apiChangeImgUser}?Avatar=${encodeURIComponent(avatarUrl)}`
  return http.patch(url)
}

const resetPassword = params =>
  http.patch(`${apiResetPassword}?${QueryString.stringify(params)}`)
const getListUserInDept = params =>
  http.get(apiGetListUserInDept, {
    params,
  })

const UserService = {
  updateAccount,
  insertUser,
  getAccount,
  deleteUser,
  detailUser,
  updateUser,
  getListUser,
  importUser,
  getTemplateFileImportUser,
  exportUser,
  importGuest,
  exportGuest,
  templateImportGuest,
  GetListGuest,
  replacePassword,
  getInforUser,
  changeInfor,
  changeAvatar,
  resetPassword,
  getListUserInDept,
  generatQRAccount,
  scanQRAccount,
}
export default UserService
