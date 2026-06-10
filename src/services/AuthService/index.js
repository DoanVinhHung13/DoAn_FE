import http from '../01_axios'
import { getRefreshToken } from 'src/redux/authTokens'
import {
  apiLogin,
  apiRegister,
  apiLogout,
  apiRefreshToken,
  apiVerifyOTP,
  apiForgotPassword,
  apiResetPassword,
  apiChangePassword,
  apiGetProfile,
  apiUpdateProfile,
  apiUploadAvatar,
  apiGetUsers,
  apiGetUserById,
  apiCreateUser,
  apiUpdateUser,
  apiDeleteUser,
  apiChangeUserStatus,
  apiChangeUserPassword,
  apiGetRoles,
  apiGetPermissions,
} from './urls'

const login = (body) => http.post(apiLogin, body)
const register = (body) => http.post(apiRegister, body)
const logout = () => http.post(apiLogout, { refreshToken: getRefreshToken() })
const refreshToken = (body) => http.post(apiRefreshToken, body)
const verifyOTP = (body) => http.post(apiVerifyOTP, body)

const forgotPassword = (body) => http.post(apiForgotPassword, body)
const resetPassword = (body) => http.post(apiResetPassword, body)
const changePassword = (body) => http.post(apiChangePassword, body)

const getProfile = () => http.get(apiGetProfile)
const updateProfile = (body) => http.put(apiUpdateProfile, body)
const uploadAvatar = (body) => http.post(apiUploadAvatar, body)

const getUsers = (params) => http.get(apiGetUsers, { params })
const getUserById = (id) => http.get(apiGetUserById(id))
const createUser = (body) => http.post(apiCreateUser, body)
const updateUser = (id, body) => http.put(apiUpdateUser(id), body)
const deleteUser = (id) => http.delete(apiDeleteUser(id))
const changeUserStatus = (id, body) => http.patch(apiChangeUserStatus(id), body)
const changeUserPassword = (id, body) => http.put(apiChangeUserPassword(id), body)

const getRoles = () => http.get(apiGetRoles)
const getPermissions = () => http.get(apiGetPermissions)

const AuthService = {
  login,
  register,
  logout,
  refreshToken,
  verifyOTP,
  forgotPassword,
  resetPassword,
  changePassword,
  getProfile,
  updateProfile,
  uploadAvatar,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changeUserStatus,
  changeUserPassword,
  getRoles,
  getPermissions,
}

export default AuthService
