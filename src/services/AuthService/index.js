/**
 * AuthService — Chỉ xử lý các API thuộc nhóm /auth/*
 *
 * POST /auth/login             → login(body)
 * POST /auth/register          → register(body)
 * POST /auth/logout            → logout()
 * POST /auth/refresh-token     → refreshToken(body)
 * POST /auth/verify-otp        → verifyOTP(body)
 * POST /auth/forgot-password   → forgotPassword(body)
 * POST /auth/reset-password    → resetPassword(body)
 * POST /auth/change-password   → changePassword(body)
 * GET  /auth/me                → getProfile()
 *
 * Lưu ý: Các API /users/* đã chuyển sang UserService
 */
import http from '../01_axios'
import { getRefreshToken } from 'src/redux/authTokens'

// ─── Endpoints ─────────────────────────────────────────────
export const AUTH_URLS = {
  login:          '/auth/login',
  register:       '/auth/register',
  logout:         '/auth/logout',
  refreshToken:   '/auth/refresh-token',
  verifyOTP:      '/auth/verify-otp',
  forgotPassword: '/auth/forgot-password',
  resetPassword:  '/auth/reset-password',
  changePassword: '/auth/change-password',
  me:             '/auth/me',
}

// ─── Methods ───────────────────────────────────────────────
const login          = (body) => http.post(AUTH_URLS.login, body)
const register       = (body) => http.post(AUTH_URLS.register, body)
const logout         = ()     => http.post(AUTH_URLS.logout, { refreshToken: getRefreshToken() })
const refreshToken   = (body) => http.post(AUTH_URLS.refreshToken, body)
const verifyOTP      = (body) => http.post(AUTH_URLS.verifyOTP, body)
const forgotPassword = (body) => http.post(AUTH_URLS.forgotPassword, body)
const resetPassword  = (body) => http.post(AUTH_URLS.resetPassword, body)
const changePassword = (body, config) => http.post(AUTH_URLS.changePassword, body, config)

/** GET /auth/me — thông tin user đang đăng nhập */
const getProfile = () => http.get(AUTH_URLS.me)

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
}

export default AuthService
