/**
 * UserService — Tất cả API thuộc nhóm /users/*
 * Swagger: https://api.eapls.io.vn/swagger/index.html → nhóm "Users"
 *
 * ─── Quản lý danh sách (Farm Manager / Land Manager) ─────
 * GET    /users                       → getUsers(params)
 * GET    /users/:id                   → getUserById(id)
 * POST   /users                       → createUser(body)      [Farm Manager only]
 * POST   /users/:id/account           → createAccount(id, body) [Manager/Supervisor]
 * PUT    /users/:id                   → updateUser(id, body)  [Farm Manager only]
 * DELETE /users/:id                   → deleteUser(id)        [Farm Manager only]
 * PUT    /users/:id/status            → changeUserStatus(id, body) — { isActive }
 * PUT    /users/:id/roles             → assignRoles(id, body) — replaces roles
 * PUT    /users/:id/password          → changeUserPassword(id, body)
 *
 * ─── Profile của user đang đăng nhập ─────────────────────
 * PUT  /users/me/profile              → updateMyProfile(body) — { fullName, phoneNumber?, dateOfBirth?, gender?, address? }
 * POST /users/me/avatar               → uploadMyAvatar(formData) — multipart, field: "file"
 *
 * Schemas thực tế (kiểm tra với Swagger):
 *   CreateUserRequest: { fullName, email, password, roles? }
 *   UpdateUserRequest: { fullName, phoneNumber?, avatarUrl?, isActive }
 *   UpdateProfileRequest: { fullName, phoneNumber?, dateOfBirth?, gender?, address? }
 *   UpdateUserStatusRequest: { isActive: boolean }
 *   AssignRolesRequest: { roles: string[] }
 */
import http from "../01_axios"

// ─── Endpoints ─────────────────────────────────────────────
export const USER_URLS = {
  list: "/users",
  detail: id => `/users/${id}`,
  byId: id => `/users/${id}`,
  status: id => `/users/${id}/status`,
  roles: id => `/users/${id}/roles`,
  createAccount: id => `/users/${id}/account`,
  password: id => `/users/${id}/password`,
  myProfile: "/users/me/profile",
  myAvatar: "/users/me/avatar",
}

// ─── Quản lý danh sách ─────────────────────────────────────

const normalizeListParams = (params = {}) => ({
  pageIndex: params.pageIndex ?? params.PageIndex,
  pageSize: params.pageSize ?? params.PageSize,
  searchKeyword: params.searchKeyword ?? params.SearchKeyword,
  role: params.role ?? params.Role,
  isActive: params.isActive ?? params.IsActive,
  hasAccount: params.hasAccount ?? params.HasAccount,
  status: params.status ?? params.Status,
})

/** GET /users with canonical camelCase query parameters. */
const getUsers = params => http.get(USER_URLS.list, { params: normalizeListParams(params) })

/** GET /user/:id */
const getUserById = id => http.get(USER_URLS.detail(id))

/**
 * POST /users — tạo tài khoản nội bộ (Farm Manager only)
 * Body: { fullName, email, password, roles? }
 */
const createUser = body => http.post(USER_URLS.list, body)

/**
 * PUT /users/:id — cập nhật hồ sơ người dùng khác (Farm Manager)
 * Body: { fullName, phoneNumber?, avatarUrl?, isActive }
 */
const updateUser = (id, body) => http.put(USER_URLS.byId(id), body)

/** DELETE /users/:id — xóa mềm, thu hồi refresh token (Farm Manager) */
const deleteUser = id => http.delete(USER_URLS.byId(id))

/**
 * PUT /users/:id/status — kích hoạt / vô hiệu hóa (Farm Manager)
 * Body: { isActive: boolean }
 * NOTE: Swagger dùng PUT (không phải PATCH)
 */
const changeUserStatus = (id, body) => http.put(USER_URLS.status(id), body)

/**
 * PUT /users/:id/roles — thay thế danh sách vai trò (Farm Manager)
 * Body: { roles: string[] }
 */
const assignRoles = (id, body) => http.put(USER_URLS.roles(id), body)

/** POST /users/:id/account — cấp mật khẩu và vai trò cho nhân viên đã tồn tại */
const createAccount = (id, body) => http.post(USER_URLS.createAccount(id), body)

/** PUT /users/:id/password — đổi mật khẩu người dùng khác (Farm Manager) */
const changeUserPassword = (id, body) => http.put(USER_URLS.password(id), body)

// ─── Profile của user đang đăng nhập ───────────────────────

/**
 * PUT /users/me/profile
 * Body: { fullName: string (required), phoneNumber?, dateOfBirth?, gender?, address? }
 * Response: UserDto đã cập nhật
 */
const updateMyProfile = body => http.put(USER_URLS.myProfile, body)

/**
 * POST /users/me/avatar — upload avatar lên Cloudinary
 * Body: FormData với field "file" (ảnh)
 */
const uploadMyAvatar = formData =>
  http.post(USER_URLS.myAvatar, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })

const UserService = {
  // Admin
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changeUserStatus,
  assignRoles,
  createAccount,
  changeUserPassword,
  // Me
  updateMyProfile,
  uploadMyAvatar,
}

export default UserService
