import STORAGE, { getStorage, setStorage, clearAuthStorage } from 'src/store/storage'

/**
 * authSession — Quản lý auth state không reactive.
 * Dùng cho: guards, axios interceptor, và các nơi cần đọc auth state
 * mà không cần trigger re-render (khác với Redux store).
 *
 * Package: store/ — phụ trách lưu trữ & đọc dữ liệu từ Browser Storage
 */
const authSession = {
  isAuthenticated() {
    return Boolean(getStorage(STORAGE.TOKEN))
  },

  getAccessToken() {
    return getStorage(STORAGE.TOKEN)
  },

  getUser() {
    return JSON.parse(getStorage(STORAGE.USER_INFO) || 'null')
  },

  /** Lưu token + user info vào Storage sau khi login thành công */
  setSessionTokens({ token, user }) {
    if (token) setStorage(STORAGE.TOKEN, token)
    if (user)  setStorage(STORAGE.USER_INFO, JSON.stringify(user))
  },

  /** Chỉ cập nhật user info (dùng khi update profile) */
  updateUser(user) {
    setStorage(STORAGE.USER_INFO, JSON.stringify(user))
  },

  /** Xóa toàn bộ auth data (dùng khi logout) */
  clearSession() {
    clearAuthStorage()
  },
}

export default authSession
