// UserService endpoints — /users/*
// Swagger: https://api.eapls.io.vn/swagger/index.html → nhóm "Users"

// Danh sách
export const apiGetUsers          = '/users'
export const apiCreateUser        = '/users'
export const apiGetUserById       = (id) => `/users/${id}`
export const apiUpdateUser        = (id) => `/users/${id}`
export const apiDeleteUser        = (id) => `/users/${id}`
export const apiChangeUserStatus  = (id) => `/users/${id}/status`   // PUT { isActive }
export const apiAssignRoles       = (id) => `/users/${id}/roles`    // POST { roles[] }
export const apiChangeUserPassword = (id) => `/users/${id}/password`

// Profile của user đang login
export const apiUpdateMyProfile   = '/users/me/profile'  // PUT { fullName, phoneNumber?, dateOfBirth? }
export const apiUploadMyAvatar    = '/users/me/avatar'   // POST multipart/form-data field: file
