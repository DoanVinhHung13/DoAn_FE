// Storage key constants — tất cả key của app tập trung tại đây
const STORAGE = {
  TOKEN:                    'token-eapls',
  REFRESH_TOKEN:            'refresh-token-eapls',
  USER_INFO:                'user-info-eapls',
  ACCESS_TOKEN_EXPIRES_AT:  'access-token-expires-at-eapls',
  REFRESH_TOKEN_EXPIRES_AT: 'refresh-token-expires-at-eapls',
  /** @deprecated giữ để tương thích phiên cũ — đồng bộ với REFRESH_TOKEN_EXPIRES_AT */
  SESSION_EXPIRES_AT:       'session-expires-at-eapls',
  KEY_MENU_ACTIVE:          'key-active-eapls',
  DEV_MODE:                 'dev-mode-eapls',
  REMEMBERED_EMAIL:         'remembered-email-eapls',
  REMEMBERED_IDENTIFIER:    'remembered-identifier-eapls',
}

/** Fallback khi API không trả refreshTokenExpiredAt */
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000

/**
 * Auth data luôn lưu localStorage (persist qua đóng tab/trình duyệt).
 * Kiểm tra hết hạn token được xử lý tại authTokens.js.
 */
export const getStorage = (name) => {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem(name) || ''
}

export const setStorage = (name, value) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(name, value)
}

export const deleteStorage = (name) => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(name)
  sessionStorage.removeItem(name)
}

export const clearStorage = () => {
  if (typeof window === 'undefined') return
  localStorage.clear()
  sessionStorage.clear()
}

export const clearAuthStorage = () => {
  deleteStorage(STORAGE.TOKEN)
  deleteStorage(STORAGE.REFRESH_TOKEN)
  deleteStorage(STORAGE.USER_INFO)
  localStorage.removeItem(STORAGE.ACCESS_TOKEN_EXPIRES_AT)
  localStorage.removeItem(STORAGE.REFRESH_TOKEN_EXPIRES_AT)
  localStorage.removeItem(STORAGE.SESSION_EXPIRES_AT)
}

export default STORAGE
