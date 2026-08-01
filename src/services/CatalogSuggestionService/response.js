export const getApiData = response => {
  const payload = response?.data ?? response
  return payload?.data ?? payload ?? []
}

export const getCatalogPrefill = response => {
  const value = getApiData(response)
  return value?.data ?? value ?? {}
}
