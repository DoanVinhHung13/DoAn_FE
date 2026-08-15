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

// ─── Methods ───────────────────────────────────────────────
const login          = (body) => http.post('/auth/login', body)
const register       = (body) => http.post('/auth/register', body)
const logout         = ()     => http.post('/auth/logout', { refreshToken: getRefreshToken() })
const refreshToken   = (body) => http.post('/auth/refresh-token', body)
const verifyOTP      = (body) => http.post('/auth/verify-otp', body)
const forgotPassword = (body) => http.post('/auth/forgot-password', body)
const resetPassword  = (body) => http.post('/auth/reset-password', body)
const changePassword = (body, config) => http.post('/auth/change-password', body, config)

/** GET /auth/me — thông tin user đang đăng nhập */
const getProfile = () => http.get('/auth/me')

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
