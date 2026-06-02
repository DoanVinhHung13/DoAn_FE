import http from '../01_axios'
import {
  // Authentication
  apiLogin,
  apiRegister,
  apiLogout,
  apiGoogleLogin,
  apiRefreshToken,
  apiVerifyOTP,
  // Password Management
  apiForgotPassword,
  apiResetPassword,
  apiChangePassword,
  apiForceChangePassword,
  // Profile
  apiGetProfile,
  apiUpdateProfile,
  apiUploadAvatar,
  // User Management
  apiGetUsers,
  apiGetUserById,
  apiCreateUser,
  apiUpdateUser,
  apiDeleteUser,
  apiChangeUserStatus,
  apiChangeUserPassword,
  // Role & Permission
  apiGetRoles,
  apiGetPermissions,
} from './urls'

// Authentication
const login = (body) => http.post(apiLogin, body)
const register = (body) => http.post(apiRegister, body)
const logout = () => http.post(apiLogout)
const googleLogin = (body) => http.post(apiGoogleLogin, body)
const refreshToken = (body) => http.post(apiRefreshToken, body)
const verifyOTP = (body) => http.post(apiVerifyOTP, body)

// Password Management
const forgotPassword = (body) => http.post(apiForgotPassword, body)
const resetPassword = (body) => http.post(apiResetPassword, body)
const changePassword = (body) => http.put(apiChangePassword, body)
const forceChangePassword = (body) => http.put(apiForceChangePassword, body)

// Profile
const getProfile = () => http.get(apiGetProfile)
const updateProfile = (body) => http.put(apiUpdateProfile, body)
const uploadAvatar = (body) => http.post(apiUploadAvatar, body)

// User Management
const getUsers = (params) => http.get(apiGetUsers, { params })
const getUserById = (id) => http.get(apiGetUserById(id))
const createUser = (body) => http.post(apiCreateUser, body)
const updateUser = (id, body) => http.put(apiUpdateUser(id), body)
const deleteUser = (id) => http.delete(apiDeleteUser(id))
const changeUserStatus = (id, body) => http.patch(apiChangeUserStatus(id), body)
const changeUserPassword = (id, body) => http.put(apiChangeUserPassword(id), body)

// Role & Permission
const getRoles = () => http.get(apiGetRoles)
const getPermissions = () => http.get(apiGetPermissions)

const AuthService = {
  // Authentication
  login,
  register,
  logout,
  googleLogin,
  refreshToken,
  verifyOTP,
  // Password Management
  forgotPassword,
  resetPassword,
  changePassword,
  forceChangePassword,
  // Profile
  getProfile,
  updateProfile,
  uploadAvatar,
  // User Management
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changeUserStatus,
  changeUserPassword,
  // Role & Permission
  getRoles,
  getPermissions,
}

export default AuthService
