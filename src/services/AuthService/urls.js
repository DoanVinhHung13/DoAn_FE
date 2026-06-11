// AuthService endpoints — chỉ /auth/*
// (giữ file này để tương thích import cũ nếu có)

export const apiLogin           = '/auth/login'
export const apiRegister        = '/auth/register'
export const apiLogout          = '/auth/logout'
export const apiRefreshToken    = '/auth/refresh-token'
export const apiVerifyOTP       = '/auth/verify-otp'
export const apiForgotPassword  = '/auth/forgot-password'
export const apiResetPassword   = '/auth/reset-password'
export const apiChangePassword  = '/auth/change-password'
export const apiGetProfile      = '/auth/me'
