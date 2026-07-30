const toNumber = value => {
  if (value === null || value === undefined || value === "") return null

  const normalizedValue =
    typeof value === "string" ? value.replace(",", ".").trim() : value
  const number = Number(normalizedValue)

  return Number.isFinite(number) ? number : null
}

export const formatMeasurementValue = value => {
  const number = toNumber(value)
  if (number === null) return "—"
  if (Number.isInteger(number)) return String(number)

  return number
    .toFixed(2)
    .replace(/\.0+$/, "")
    .replace(/(\.\d*?)0+$/, "$1")
}
