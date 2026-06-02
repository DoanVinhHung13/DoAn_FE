import http from '../01_axios'
import {
  apiLogin,
  apiRegister,
  apiLogout,
  apiGoogleLogin,
  apiForgotPassword,
  apiResetPassword,
  apiForceChangePassword,
  apiChangePassword,
  apiGetProfile,
} from './urls'

const login = (body) => http.post(apiLogin, body)
const register = (body) => http.post(apiRegister, body)
const logout = () => http.post(apiLogout)
const googleLogin = (body) => http.post(apiGoogleLogin, body)
const forgotPassword = (body) => http.post(apiForgotPassword, body)
const resetPassword = (body) => http.post(apiResetPassword, body)
const forceChangePassword = (body) => http.put(apiForceChangePassword, body)
const changePassword = (body) => http.put(apiChangePassword, body)
const getProfile = () => http.get(apiGetProfile)

const AuthService = {
  login,
  register,
  logout,
  googleLogin,
  forgotPassword,
  resetPassword,
  forceChangePassword,
  changePassword,
  getProfile,
}

export default AuthService
