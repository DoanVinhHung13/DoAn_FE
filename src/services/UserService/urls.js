// User API endpoints
export const apiGetUserInfo = '/users/profile'  // dùng bởi DefaultAction
export const apiGetUsers = '/users'
export const apiCreateUser = '/users'
export const apiBulkImportUsers = '/users/bulk'
export const apiUpdateProfile = '/users/profile'
export const apiGetUserById = (id) => `/users/${id}`
export const apiUpdateUser = (id) => `/users/${id}`
export const apiDeleteUser = (id) => `/users/${id}`
export const apiChangeUserPassword = (id) => `/users/${id}/password`
export const apiToggleUserStatus = (id) => `/users/${id}/status`
