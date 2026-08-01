export const normalizeString = (value) => {
  return String(value ?? '').trim().toLowerCase()
}

export const normalizeVietnamese = (value) => {
  return String(value ?? '').trim().toLocaleLowerCase('vi')
}

export const normalizeForSearch = (value) => {
  return String(value || '').trim().toLowerCase().replace(/[\s_-]+/g, '')
}

export const defaultSelectFilterOption = (input, option) => {
  const label = option?.label ?? ''
  return String(label).toLowerCase().includes(input.toLowerCase())
}

export const isEmpty = (value) => {
  if (value == null) return true
  if (typeof value === 'string') return value.trim().length === 0
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

export const displayValue = (value, fallback = '—') => {
  return isEmpty(value) ? fallback : value
}
