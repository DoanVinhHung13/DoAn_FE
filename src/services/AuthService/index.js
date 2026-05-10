import axios from "axios"
import QueryString from "qs"
import http from "../01_axios"
import {
  apiCallBackLoginGoole,
  apiChangePassword,
  apiForgotPassword,
  apiLogin,
  apiLoginGoole,
  apiLogout,
  apiRegister,
  apiResendOtp,
  apiScanCCCD,
  apiVerifyCode,
  apiVerifyCodeRegister,
} from "./urls"

const login = body => http.post(apiLogin, body)
const register = body => http.post(apiRegister, body)
const forgotPass = body => http.post(apiForgotPassword, body)
const verifyCode = body => http.post(apiVerifyCode, body)
const verifyCodeRegister = body => http.post(apiVerifyCodeRegister, body)
const resendOtp = body => {
  const params = QueryString.stringify(body)
  return http.post(`${apiResendOtp}?${params}`)
}
const changePassword = body => http.post(apiChangePassword, body)
const callbackGG = params => http.get(apiCallBackLoginGoole, { params })

const loginGG = body => {
  const params = QueryString.stringify(body)
  return http.get(`${apiLoginGoole}?${params}`)
}

const logout = () => http.get(apiLogout)
const ScanCCCD = body => http.post(apiScanCCCD, body)

//Lấy thông tin mã số thuế
const getInfoByTaxCode = code =>
  axios({
    method: "get",
    url: `https://api.vietqr.io/v2/business/${code}`,
    // data: { user }
  })
//Lấy thông tin mã số thuế
const paymentApi = body => {
  return axios({
    method: "post",
    url: `https://api.vietqr.io/v2/generate`,
    data: body,
    headers: {
      "x-client-id": process.env.REACT_APP_CLIENT_ID,
      "x-api-key": process.env.REACT_APP_API_KEY,
    },
  })
}

const AuthService = {
  getInfoByTaxCode,
  login,
  loginGG,
  callbackGG,
  logout,
  register,
  forgotPass,
  verifyCode,
  verifyCodeRegister,
  resendOtp,
  changePassword,
  ScanCCCD,
}
export default AuthService
