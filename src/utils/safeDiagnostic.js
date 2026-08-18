const getSafeErrorMetadata = (error, metadata = {}) => ({
  ...metadata,
  type: error?.type || error?.kind,
  code: error?.code,
  status: error?.status,
  traceId: error?.traceId,
})

export const logDevDiagnostic = (operation, error, metadata) => {
  if (!import.meta.env?.DEV) return
  console.warn(
    `[${operation}] request failed`,
    getSafeErrorMetadata(error, metadata),
  )
}
