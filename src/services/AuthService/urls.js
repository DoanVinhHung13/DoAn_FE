// Auth API endpoints — đối chiếu Swagger: https://api.eapls.io.vn/swagger/index.html
// Base URL (axios): https://api.eapls.io.vn/api

// Authentication
export const apiLogin = "/auth/login"
export const apiRegister = "/auth/register"
export const apiLogout = "/auth/logout"
export const apiRefreshToken = "/auth/refresh-token"
export const apiVerifyOTP = "/auth/verify-otp"

// Password Management
export const apiForgotPassword = "/auth/forgot-password"
export const apiResetPassword = "/auth/reset-password"
export const apiChangePassword = "/auth/change-password"

// Profile (GET me thuộc Auth; cập nhật profile/avatar thuộc Users)
export const apiGetProfile = "/auth/me"
export const apiUpdateProfile = "/users/me/profile"
export const apiUploadAvatar = "/users/me/avatar"

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
