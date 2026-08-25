import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"
import customParseFormat from "dayjs/plugin/customParseFormat"
import "dayjs/locale/vi"

dayjs.extend(relativeTime)
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(customParseFormat)
dayjs.locale("vi")

const DEFAULT_TIME_ZONE = "Asia/Ho_Chi_Minh"

export const getApplicationTimeZone = () =>
  (typeof window !== "undefined" && window.env?.TIME_ZONE) ||
  import.meta.env.VITE_TIME_ZONE ||
  DEFAULT_TIME_ZONE

export const getLocalNow = () => dayjs.tz(undefined, getApplicationTimeZone())

const parseDateOnly = date => {
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return dayjs(date, "YYYY-MM-DD", true)
  }

  return null
}

const inConfiguredTimezone = date => {
  const dateOnly = parseDateOnly(date)
  if (dateOnly) return dateOnly

  return dayjs.utc(date).tz(getApplicationTimeZone())
}

export const formatDateOnly = (date, format = "DD/MM/YYYY") => {
  if (!date) return "---"
  const formatStr = typeof format === "string" ? format : "DD/MM/YYYY"
  if (dayjs.isDayjs(date)) return date.format(formatStr)

  const dateOnly = parseDateOnly(date)
  return (dateOnly || inConfiguredTimezone(date)).format(formatStr)
}

export const formatVietnamDateTime = (date, format = "HH:mm - DD/MM/YYYY") => {
  if (!date) return "---"
  const formatStr = typeof format === "string" ? format : "HH:mm - DD/MM/YYYY"
  return dayjs.utc(date).tz(getApplicationTimeZone()).format(formatStr)
}

export const toUtcISOString = date => {
  if (!date) return null
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("Date-only values must use formatDateForApi, not toUtcISOString.")
  }
  return (dayjs.isDayjs(date) ? date : dayjs(date)).toISOString()
}

const inConfiguredTimezoneLegacy = date => {
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return parseDateOnly(date)
  }

  return dayjs.utc(date).tz(getApplicationTimeZone())
}

export const formatDateForApi = date => {
  if (!date) return null
  if (dayjs.isDayjs(date)) return date.format("YYYY-MM-DD")
  return inConfiguredTimezone(date).format("YYYY-MM-DD")
}

export const formatDate = (date, format = "DD/MM/YYYY") => {
  return formatDateOnly(date, format)
}

export const formatDateTime = (date, format = "HH:mm - DD/MM/YYYY") => {
  return formatVietnamDateTime(date, format)
}

export const timeAgo = date => {
  if (!date) return "---"
  return inConfiguredTimezone(date).fromNow()
}

export const parseDate = date => {
  if (!date) return null
  return inConfiguredTimezoneLegacy(date)
}
