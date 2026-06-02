import STORAGE, { getStorage, setStorage, clearAuthStorage } from 'src/lib/storage'

/**
 * authSession — thay thế Zustand useAuthStore.
 * Cung cấp cùng dữ liệu { user, token } nhưng không reactive.
 * Dùng cho guards, axios interceptor, và các nơi cần đọc auth state mà không cần re-render.
 */
export const authSession = {
  isAuthenticated() {
    return Boolean(getStorage(STORAGE.TOKEN))
  },

  getAccessToken() {
    return getStorage(STORAGE.TOKEN)
  },

  getUser() {
    return JSON.parse(getStorage(STORAGE.USER_INFO) || 'null')
  },

  setSessionTokens({ token, user }) {
    if (token) setStorage(STORAGE.TOKEN, token)
    if (user) setStorage(STORAGE.USER_INFO, JSON.stringify(user))
  },

  updateUser(user) {
    setStorage(STORAGE.USER_INFO, JSON.stringify(user))
  },

  clearSession() {
    clearAuthStorage()
  },
}

export default authSession
