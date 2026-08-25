const FALLBACK_MESSAGES = {
  network:
    "Không thể kết nối đến hệ thống. Vui lòng kiểm tra đường truyền và thử lại.",
  timeout: "Yêu cầu đã hết thời gian chờ. Vui lòng thử lại.",
  unknown: "Yêu cầu thất bại. Vui lòng thử lại sau.",
}

const GENERIC_MESSAGES = new Set(["success", "ok", "thành công", "thành công."])

const asText = value => (typeof value === "string" ? value.trim() : "")

const asFieldMessage = value =>
  Array.isArray(value)
    ? asText(value.find(item => asText(item)))
    : asText(value)

const isApiResponse = body =>
  Boolean(body) &&
  typeof body === "object" &&
  typeof body.success === "boolean" &&
  typeof body.message === "string" &&
  (Array.isArray(body.errors) || body.errors == null) &&
  (Array.isArray(body.fieldErrors) || body.fieldErrors == null)

export const isGenericApiMessage = message =>
  GENERIC_MESSAGES.has(asText(message).toLowerCase())

export const getApiMessage = body => {
  const message = asText(body?.message)
  if (message) return message

  const errors = Array.isArray(body?.errors) ? body.errors : []
  const firstError = errors.find(error => asText(error))
  return asText(firstError)
}

export const getApiFieldErrors = body =>
  Array.isArray(body?.fieldErrors) ? body.fieldErrors : []

const toFormFieldName = field => {
  if (Array.isArray(field)) return field
  if (typeof field !== "string" || !field.trim()) return null

  return field
    .split(".")
    .map(part =>
      part ? `${part.charAt(0).toLowerCase()}${part.slice(1)}` : part,
    )
}

const hasMappedFieldErrors = (error, fieldMapping) =>
  Array.isArray(error?.fieldErrors) &&
  error.fieldErrors.some(fieldError => {
    const field = fieldError?.field
    return Boolean(
      asFieldMessage(fieldError?.message) &&
      Object.prototype.hasOwnProperty.call(fieldMapping || {}, field) &&
      fieldMapping[field],
    )
  })

export const shouldShowGlobalApiError = (error, config = {}) => {
  const handling = config.errorHandling

  if (config.skipNotice || handling === "silent") return false
  if (error?.kind !== "api") return true
  if (handling === "component") return false

  if (handling === "form") {
    if (error.code === "NOT_FOUND") return false
    if (error.code === "VALIDATION_ERROR") {
      return !hasMappedFieldErrors(error, config.fieldErrorMapping)
    }
  }

  return true
}

export const applyApiFieldErrors = (form, error, fieldMapping) => {
  if (
    error?.kind !== "api" ||
    !Array.isArray(error?.fieldErrors) ||
    !form?.setFields
  ) {
    return 0
  }

  const mappedFields = new Set()
  const fieldErrors = error.fieldErrors.reduce((result, fieldError) => {
    const backendField = fieldError?.field
    const name = fieldMapping
      ? Object.prototype.hasOwnProperty.call(fieldMapping, backendField)
        ? fieldMapping[backendField]
        : null
      : toFormFieldName(backendField)
    const message = asFieldMessage(fieldError?.message)

    if (!name || !message || mappedFields.has(String(name))) return result

    mappedFields.add(String(name))
    result.push({ name, errors: [message] })
    return result
  }, [])

  if (fieldErrors.length > 0) form.setFields(fieldErrors)
  return fieldErrors.length
}

export const createApiError = ({
  body,
  status,
  config,
  cause,
  kind = "api",
  fallbackMessage,
  noticeShown = false,
} = {}) => {
  const message = getApiMessage(body)

  const error = new Error(message, { cause })
  error.name = "ApiError"
  error.isApiError = true
  error.kind = kind
  error.code = asText(body?.code) || null
  error.status = status ?? cause?.response?.status ?? null
  error.fieldErrors = getApiFieldErrors(body)
  error.errors = Array.isArray(body?.errors) ? body.errors : []
  error.responseData = isApiResponse(body) ? body : null
  error.config = config || cause?.config || null
  error.skipNotice = Boolean(config?.skipNotice || cause?.config?.skipNotice)
  error.requestUrl = config?.url || cause?.config?.url || ""
  error.requestMethod = config?.method || cause?.config?.method || ""
  error.requestData = config?.data || cause?.config?.data
  error.traceId = asText(body?.traceId) || null
  error.noticeShown = noticeShown
  error.originalError = cause || null
  return error
}

export const normalizeApiError = (error, { noticeShown = false } = {}) => {
  if (isApiError(error)) return error

  const body = error?.response?.data
  const status = error?.response?.status
  if (isApiResponse(body)) {
    return createApiError({
      body,
      status,
      config: error?.config,
      cause: error,
      noticeShown,
    })
  }

  if (error?.code === "ECONNABORTED" || error?.code === "ETIMEDOUT") {
    return createApiError({
      status,
      config: error?.config,
      cause: error,
      kind: "timeout",
      noticeShown,
    })
  }

  if (!error?.response) {
    return createApiError({
      status,
      config: error?.config,
      cause: error,
      kind: "network",
      noticeShown,
    })
  }

  return createApiError({
    status,
    config: error?.config,
    cause: error,
    kind: "unknown",
    noticeShown,
  })
}

export const isApiError = error => Boolean(error?.isApiError)

export const isNotFoundError = error =>
  error?.code === "NOT_FOUND" || (!error?.code && error?.status === 404)
