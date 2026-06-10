import STORAGE, { getStorage, setStorage, clearAuthStorage } from 'src/redux/storage'
import {
  persistAuthPayload,
  purgeExpiredAuth,
  isRefreshTokenExpired,
} from 'src/redux/authTokens'

/**
 * authSession — Quản lý auth state không reactive.
 * Token/refresh/expiry: authTokens.js | User info: storage
 */
const authSession = {
  isAuthenticated() {
    purgeExpiredAuth()
    return Boolean(getStorage(STORAGE.TOKEN)) && !isRefreshTokenExpired()
  },

  getAccessToken() {
    purgeExpiredAuth()
    return getStorage(STORAGE.TOKEN)
  },

  getUser() {
    return JSON.parse(getStorage(STORAGE.USER_INFO) || 'null')
  },

  /** Lưu phiên từ response API login hoặc refresh-token */
  persistAuth(apiData) {
    return persistAuthPayload(apiData)
  },

  /** @deprecated dùng persistAuth(apiData) */
  persistLoginSession({ token, refreshToken, refreshTokenExpiredAt, accessTokenExpiredAt, user }) {
    const ok = persistAuthPayload({
      accessToken: token,
      refreshToken,
      refreshTokenExpiredAt,
      accessTokenExpiredAt,
    })
    if (user) setStorage(STORAGE.USER_INFO, JSON.stringify(user))
    return ok
  },

  setSessionTokens({ token, user, refreshToken, refreshTokenExpiredAt, accessTokenExpiredAt }) {
    this.persistLoginSession({ token, refreshToken, refreshTokenExpiredAt, accessTokenExpiredAt, user })
  },

  updateUser(user) {
    setStorage(STORAGE.USER_INFO, JSON.stringify(user))
  },

  clearSession() {
    clearAuthStorage()
  },
}

export default authSession
