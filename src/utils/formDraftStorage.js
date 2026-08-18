import dayjs from "dayjs"

export const FORM_DRAFT_VERSION = 1
export const FORM_DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000

const SENSITIVE_FIELD_PATTERN =
  /(password|token|authorization|secret|otp|credential)/i
const FILE_FIELD_PATTERN = /^(file|originFileObj|blob)$/i

const isFileLike = value =>
  (typeof File !== "undefined" && value instanceof File) ||
  (typeof Blob !== "undefined" && value instanceof Blob)

const serializeValue = (value, fieldName = "") => {
  if (
    SENSITIVE_FIELD_PATTERN.test(fieldName) ||
    FILE_FIELD_PATTERN.test(fieldName)
  )
    return undefined
  if (
    value === undefined ||
    typeof value === "function" ||
    typeof value === "symbol"
  )
    return undefined
  if (isFileLike(value)) return undefined

  if (dayjs.isDayjs(value)) {
    return { __eaplsType: "dayjs", value: value.toISOString() }
  }

  if (value instanceof Date) {
    return { __eaplsType: "date", value: value.toISOString() }
  }

  if (Array.isArray(value)) {
    return value
      .map(item => serializeValue(item, fieldName))
      .filter(item => item !== undefined)
  }

  if (value && typeof value === "object") {
    return Object.entries(value).reduce((result, [key, childValue]) => {
      const serialized = serializeValue(childValue, key)
      if (serialized !== undefined) result[key] = serialized
      return result
    }, {})
  }

  return value
}

const deserializeValue = value => {
  if (Array.isArray(value)) return value.map(deserializeValue)
  if (!value || typeof value !== "object") return value

  if (value.__eaplsType === "dayjs") return dayjs(value.value)
  if (value.__eaplsType === "date") return new Date(value.value)

  return Object.entries(value).reduce((result, [key, childValue]) => {
    result[key] = deserializeValue(childValue)
    return result
  }, {})
}

export const buildFormDraftKey = ({ userId, module, mode, entityId }) => {
  if (!userId || !module || !mode) return ""
  const base = `eapls:${String(userId)}:draft:${module}:${mode}`
  return mode === "edit" && entityId !== undefined && entityId !== null
    ? `${base}:${String(entityId)}`
    : base
}

export const saveFormDraft = (storageKey, data) => {
  if (!storageKey || typeof window === "undefined") return false

  try {
    const payload = {
      version: FORM_DRAFT_VERSION,
      savedAt: new Date().toISOString(),
      data: serializeValue(data),
    }
    window.localStorage.setItem(storageKey, JSON.stringify(payload))
    return true
  } catch {
    return false
  }
}

export const loadFormDraft = (
  storageKey,
  { now = Date.now(), ttlMs = FORM_DRAFT_TTL_MS } = {},
) => {
  if (!storageKey || typeof window === "undefined") return null

  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return null

    const payload = JSON.parse(raw)
    const savedAt = Date.parse(payload?.savedAt)
    if (
      payload?.version !== FORM_DRAFT_VERSION ||
      !payload?.data ||
      Number.isNaN(savedAt) ||
      now - savedAt > ttlMs
    ) {
      window.localStorage.removeItem(storageKey)
      return null
    }

    return {
      version: payload.version,
      savedAt: payload.savedAt,
      data: deserializeValue(payload.data),
    }
  } catch {
    try {
      window.localStorage.removeItem(storageKey)
    } catch {
      // Storage may be unavailable or read-only.
    }
    return null
  }
}

export const removeFormDraft = storageKey => {
  if (!storageKey || typeof window === "undefined") return
  try {
    window.localStorage.removeItem(storageKey)
  } catch {
    // Storage may be unavailable or read-only.
  }
}
