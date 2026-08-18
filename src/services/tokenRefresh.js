import axios from 'axios'
import { clearAuthStorage } from 'src/redux/storage'
import {
  persistAuthPayload,
  getRefreshToken,
  isRefreshTokenExpired,
  isAccessTokenExpired,
} from 'src/redux/authTokens'
const getBaseUrl = () =>
  (typeof window !== 'undefined' && window.env?.API_ROOT) ||
  import.meta.env.VITE_API_ROOT ||
  (import.meta.env.DEV ? '/api' : 'https://api.eapls.io.vn/api')

let refreshPromise = null

/**
 * Refresh access token khi hết hạn (hoặc sắp hết hạn).
 * Dùng axios thuần — tránh vòng lặp interceptor.
 */
export async function refreshAccessToken({ force = false } = {}) {
  if (typeof window === 'undefined') return false

  if (isRefreshTokenExpired()) {
    clearAuthStorage()
    return false
  }

  if (!force && !isAccessTokenExpired()) return true

  const refreshToken = getRefreshToken()
  if (!refreshToken) return false

  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${getBaseUrl()}/auth/refresh-token`, { refreshToken })
      .then((response) => {
        const body = response?.data
        if (!body?.success || !body?.data) return false
        return persistAuthPayload(body.data)
      })
      .catch(() => false)
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

export default refreshAccessToken
