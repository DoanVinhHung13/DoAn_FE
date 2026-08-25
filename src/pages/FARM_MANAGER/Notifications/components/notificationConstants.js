import { getNotificationTypeLabel } from "src/constants/notificationTypes"

export const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "unread", label: "Chưa đọc" },
  { value: "read", label: "Đã đọc" },
]

export const TYPE_COLORS = {
  Journal_Submitted: "blue",
  Journal_Verified: "green",
  Journal_Revision_Requested: "orange",
  Journal_Assigned: "purple",
  System: "cyan",
  Announcement: "magenta",
}

export const ROLE_OPTIONS = [
  { value: "FARM_SUPERVISOR", label: "Giám sát nông trại" },
  { value: "FARMER_LEADER", label: "Tổ trưởng" },
]

export const RECIPIENT_TYPE = {
  ALL: "all",
  BY_ROLE: "by_role",
  SPECIFIC_USERS: "specific_users",
}

export const normalizeNotifications = response => {
  const payload = response?.data ?? response ?? {}
  const nestedPayload = payload?.data ?? payload
  const items = Array.isArray(nestedPayload)
    ? nestedPayload
    : nestedPayload?.notifications ||
      nestedPayload?.items ||
      nestedPayload?.results ||
      payload?.notifications ||
      []

  const unreadCount =
    payload?.unreadCount ??
    nestedPayload?.unreadCount ??
    items.filter(item => !item.isRead).length

  return {
    items,
    unreadCount,
    totalItems:
      nestedPayload?.totalItems ?? payload?.totalItems ?? items.length,
  }
}

export const normalizeUsers = response => {
  const payload = response?.data ?? response ?? {}
  const data = payload?.data ?? payload
  return Array.isArray(data)
    ? data
    : data?.items || data?.results || data?.users || []
}

export const getCategory = getNotificationTypeLabel

export const getUserId = user => user?.id || user?._id || user?.userId

export const getUserRoles = user => {
  const roles = Array.isArray(user?.roles) ? user.roles : [user?.role]
  return roles.filter(Boolean).map(role => String(role).toUpperCase())
}

export const hasRole = (user, role) => getUserRoles(user).includes(role)
