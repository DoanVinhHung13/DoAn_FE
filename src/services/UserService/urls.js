// User API endpoints — Swagger: https://api.eapls.io.vn/swagger/index.html
export const apiGetUserInfo = '/auth/me'
export const apiGetUsers = '/users'
export const apiCreateUser = '/users'
export const apiBulkImportUsers = '/users/bulk'
export const apiUpdateProfile = '/users/me/profile'
export const apiGetUserById = (id) => `/users/${id}`
export const apiUpdateUser = (id) => `/users/${id}`
export const apiDeleteUser = (id) => `/users/${id}`
export const apiChangeUserPassword = (id) => `/users/${id}/password`
export const apiToggleUserStatus = (id) => `/users/${id}/status`
