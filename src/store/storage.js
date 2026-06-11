// Storage key constants — tất cả key của app tập trung tại đây
const STORAGE = {
  TOKEN:           'token-ebookfarm',
  REFRESH_TOKEN:   'refresh-token-ebookfarm',
  USER_INFO:       'user-info-ebookfarm',
  REMEMBER_LOGIN:  'ebookfarm-remember',
  KEY_MENU_ACTIVE: 'key-active-ebookfarm',
  DEV_MODE:        'dev-mode-ebookfarm',
}

/**
 * Tự động chọn localStorage hoặc sessionStorage dựa theo "remember me".
 * Nếu REMEMBER_LOGIN được set → dùng localStorage (persist qua lần mở lại).
 * Nếu không → dùng sessionStorage (clear khi đóng tab).
 */
export const getStorage = (name) => {
  if (typeof window === 'undefined') return ''
  const remember = localStorage.getItem(STORAGE.REMEMBER_LOGIN)
  const data = remember
    ? localStorage.getItem(name)
    : sessionStorage.getItem(name)
  return data || ''
}

export const setStorage = (name, value) => {
  if (typeof window === 'undefined') return
  const remember = localStorage.getItem(STORAGE.REMEMBER_LOGIN)
  if (remember) localStorage.setItem(name, value)
  else sessionStorage.setItem(name, value)
}

export const deleteStorage = (name) => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(name)
  sessionStorage.removeItem(name)
}

export const clearStorage = () => {
  if (typeof window === 'undefined') return
  const remember = localStorage.getItem(STORAGE.REMEMBER_LOGIN)
  if (remember) localStorage.clear()
  else sessionStorage.clear()
}

// Chỉ xóa token + user info (dùng khi logout)
export const clearAuthStorage = () => {
  deleteStorage(STORAGE.TOKEN)
  deleteStorage(STORAGE.REFRESH_TOKEN)
  deleteStorage(STORAGE.USER_INFO)
}

export default STORAGE
