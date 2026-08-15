const toDateOnly = value => {
  if (!value) return null
  if (value instanceof Date) {
    const copy = new Date(value)
    copy.setHours(0, 0, 0, 0)
    return copy
  }

  const text = String(value).trim()
  const vietnameseDate = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/)
  const date = vietnameseDate
    ? new Date(Number(vietnameseDate[3]), Number(vietnameseDate[2]) - 1, Number(vietnameseDate[1]))
    : new Date(text)

  if (Number.isNaN(date.getTime())) return null
  date.setHours(0, 0, 0, 0)
  return date
}

const getQuarantineEndDate = warning => {
  const explicitEndDate = warning?.eligibleDate || warning?.quarantineUntil
  if (explicitEndDate) return toDateOnly(explicitEndDate)

  const lastUsedDate = warning?.lastUsedDate ||
    warning?.lastApplicationDate ||
    warning?.usageDate ||
    warning?.date
  const isolationDays = Number(warning?.isolationDays ?? warning?.quarantineDays)
  const endDate = toDateOnly(lastUsedDate)

  if (!endDate || !Number.isFinite(isolationDays)) return null
  endDate.setDate(endDate.getDate() + Math.max(0, isolationDays))
  return endDate
}

const isQuarantineActive = warning => {
  const endDate = getQuarantineEndDate(warning)
  if (!endDate) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today < endDate
}

export const getActiveQuarantineWarnings = warnings =>
  (Array.isArray(warnings) ? warnings : []).filter(isQuarantineActive)
