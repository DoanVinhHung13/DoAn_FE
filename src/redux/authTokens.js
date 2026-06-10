import STORAGE, {
  SESSION_DURATION_MS,
  clearAuthStorage,
  getStorage,
  setStorage,
} from 'src/redux/storage'

const parseExpiryMs = (iso) => {
  if (!iso) return null
  const ts = new Date(iso).getTime()
  return Number.isNaN(ts) ? null : ts
}

/** Chuẩn hóa payload auth từ API login / refresh-token */
export const normalizeAuthPayload = (data) => ({
  accessToken: data?.accessToken || data?.token || null,
  refreshToken: data?.refreshToken || null,
  accessTokenExpiredAt: parseExpiryMs(data?.accessTokenExpiredAt),
  refreshTokenExpiredAt: parseExpiryMs(data?.refreshTokenExpiredAt),
})

const getRefreshExpiresAtMs = () => {
  const raw =
    localStorage.getItem(STORAGE.REFRESH_TOKEN_EXPIRES_AT) ||
    localStorage.getItem(STORAGE.SESSION_EXPIRES_AT)
  return raw ? Number(raw) : null
}

export const isRefreshTokenExpired = () => {
  if (typeof window === 'undefined') return true
  const expiresAt = getRefreshExpiresAtMs()
  if (!expiresAt) return false
  return Date.now() >= expiresAt
}

/** accessToken hết hạn (có buffer để refresh trước khi BE từ chối) */
export const isAccessTokenExpired = (bufferMs = 60_000) => {
  if (typeof window === 'undefined') return false
  const raw = localStorage.getItem(STORAGE.ACCESS_TOKEN_EXPIRES_AT)
  if (!raw) return false
  return Date.now() >= Number(raw) - bufferMs
}

/** @deprecated dùng isRefreshTokenExpired */
export const isSessionExpired = isRefreshTokenExpired

const setExpiryMeta = ({ accessTokenExpiredAt, refreshTokenExpiredAt }) => {
  if (accessTokenExpiredAt) {
    localStorage.setItem(STORAGE.ACCESS_TOKEN_EXPIRES_AT, String(accessTokenExpiredAt))
  }
  const refreshExpiry =
    refreshTokenExpiredAt ?? Date.now() + SESSION_DURATION_MS
  localStorage.setItem(STORAGE.REFRESH_TOKEN_EXPIRES_AT, String(refreshExpiry))
  localStorage.setItem(STORAGE.SESSION_EXPIRES_AT, String(refreshExpiry))
}

const clearExpiryMeta = () => {
  localStorage.removeItem(STORAGE.ACCESS_TOKEN_EXPIRES_AT)
  localStorage.removeItem(STORAGE.REFRESH_TOKEN_EXPIRES_AT)
  localStorage.removeItem(STORAGE.SESSION_EXPIRES_AT)
}

/** Lưu accessToken + refreshToken + thời hạn từ response API */
export const persistAuthPayload = (data) => {
  if (typeof window === 'undefined') return false

  const {
    accessToken,
    refreshToken,
    accessTokenExpiredAt,
    refreshTokenExpiredAt,
  } = normalizeAuthPayload(data)

  if (!accessToken) return false

  setExpiryMeta({ accessTokenExpiredAt, refreshTokenExpiredAt })
  localStorage.setItem(STORAGE.TOKEN, accessToken)
  if (refreshToken) localStorage.setItem(STORAGE.REFRESH_TOKEN, refreshToken)

  sessionStorage.removeItem(STORAGE.TOKEN)
  sessionStorage.removeItem(STORAGE.REFRESH_TOKEN)
  sessionStorage.removeItem(STORAGE.USER_INFO)

  return true
}

export const purgeExpiredAuth = () => {
  if (!isRefreshTokenExpired()) return false
  clearAuthStorage()
  return true
}

export const getRefreshToken = () => getStorage(STORAGE.REFRESH_TOKEN)
