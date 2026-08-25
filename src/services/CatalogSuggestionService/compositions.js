export const normalizeFertilizerCatalogCompositions = compositions => {
  if (!Array.isArray(compositions)) return []

  return compositions.flatMap(item => {
    const name = item?.name ?? item?.Name
    const value = item?.value ?? item?.Value
    const unit = item?.unit ?? item?.Unit
    const normalizedName = typeof name === "string" ? name.trim() : ""
    const normalizedUnit = typeof unit === "string" ? unit.trim() : ""
    const normalizedValue = Number(value)

    if (!normalizedName || !normalizedUnit || !Number.isFinite(normalizedValue))
      return []
    return [
      { name: normalizedName, value: normalizedValue, unit: normalizedUnit },
    ]
  })
}

const createRowId = () => {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return `composition-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export const createFertilizerComponentRow = (initialValues = {}) => ({
  id: initialValues.id ?? createRowId(),
  name: initialValues.name ?? "",
  value: initialValues.value ?? null,
  unit: initialValues.unit ?? "%",
  ...(initialValues.base !== undefined ? { base: initialValues.base } : {}),
  ...(initialValues.exponent !== undefined
    ? { exponent: initialValues.exponent }
    : {}),
})

export const mapCatalogCompositionsToRows = compositions =>
  normalizeFertilizerCatalogCompositions(compositions).map(
    createFertilizerComponentRow,
  )
