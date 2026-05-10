import STORAGE, {
  clearAuthStorage,
  deleteStorage,
  getStorage,
  setStorage,
} from "src/lib/storage"
import ROUTER from "src/router/ROUTER"

export const authSession = {
  isAuthenticated() {
    return Boolean(getStorage(STORAGE.TOKEN))
  },
  getAccessToken() {
    return getStorage(STORAGE.TOKEN)
  },
  getRefreshToken() {
    return getStorage(STORAGE.REFRESH_TOKEN)
  },
  setSessionTokens({ accessToken, refreshToken, remember }) {
    if (remember !== undefined) {
      setStorage(STORAGE.REMEMBER_LOGIN, remember ? "1" : "")
    }
    if (accessToken) {
      setStorage(STORAGE.TOKEN, accessToken)
    }
    if (refreshToken) {
      setStorage(STORAGE.REFRESH_TOKEN, refreshToken)
    }
  },
  saveReturnUrl(path) {
    if (!path || path === ROUTER.LOGIN) return
    setStorage(STORAGE.RETURN_URL, path)
  },
  consumeReturnUrl() {
    const returnUrl = getStorage(STORAGE.RETURN_URL)
    deleteStorage(STORAGE.RETURN_URL)
    return returnUrl || ROUTER.DEFAULT
  },
  clearSession() {
    clearAuthStorage()
  },
}

export default authSession
