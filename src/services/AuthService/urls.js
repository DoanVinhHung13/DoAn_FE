// Auth API endpoints
// Base URL: http://103.245.236.147:5000/api

// Authentication
export const apiLogin = "/auth/login"
export const apiRegister = "/auth/register"
export const apiLogout = "/auth/logout"
export const apiGoogleLogin = "/auth/google"
export const apiRefreshToken = "/auth/refresh-token"
export const apiVerifyOTP = "/auth/verify-otp"

// Password Management
export const apiForgotPassword = "/auth/forgot-password"
export const apiResetPassword = "/auth/reset-password"
export const apiChangePassword = "/auth/change-password"
export const apiForceChangePassword = "/auth/force-change-password"

// Profile
export const apiGetProfile = "/auth/me"
export const apiUpdateProfile = "/auth/profile"
export const apiUploadAvatar = "/auth/profile/avatar"

// User Management
export const apiGetUsers = "/users"
export const apiGetUserById = (id) => `/users/${id}`
export const apiCreateUser = "/users"
export const apiUpdateUser = (id) => `/users/${id}`
export const apiDeleteUser = (id) => `/users/${id}`
export const apiChangeUserStatus = (id) => `/users/${id}/status`
export const apiChangeUserPassword = (id) => `/users/${id}/password`

// Role & Permission
export const apiGetRoles = "/roles"
export const apiGetPermissions = "/permissions"
