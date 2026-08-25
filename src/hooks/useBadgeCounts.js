import { useState, useEffect, useCallback, useMemo } from "react"
import { getNotifications } from "src/services/NotificationService"
import STORAGE, { getStorage } from "src/redux/storage"

const EMPTY_BADGE_COUNTS = {
  joinRequest: 0,
  leaveRequest: 0,
  supportRequest: 0,
  incomeAndExpenditureRequest: 0,
}

const normalizeNotifications = response => {
  const payload = response?.data ?? response ?? {}
  const nestedPayload = payload?.data ?? payload
  const items = Array.isArray(nestedPayload)
    ? nestedPayload
    : nestedPayload?.notifications || nestedPayload?.items || []
  return {
    items,
    unreadCount:
      payload?.unreadCount ??
      nestedPayload?.unreadCount ??
      items.filter(item => !item.isRead).length,
  }
}

export const useBadgeCounts = () => {
  const isAuthenticated = Boolean(getStorage(STORAGE.TOKEN))
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchData = useCallback(() => {
    if (!getStorage(STORAGE.TOKEN)) return
    setIsLoading(true)
    getNotifications()
      .then(res => setData(normalizeNotifications(res)))
      .catch(err => setError(err))
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return
    const timeout = setTimeout(fetchData, 0)
    const interval = setInterval(fetchData, 5 * 60 * 1000)
    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
    }
  }, [isAuthenticated, fetchData])

  const unreadCount = data?.unreadCount || 0
  const badgeCounts = useMemo(
    () => ({ ...EMPTY_BADGE_COUNTS, unreadCount }),
    [unreadCount],
  )

  return {
    badgeCounts,
    unreadCount,
    loading: isLoading,
    error,
    connectionReady: isAuthenticated,
    refreshCounts: fetchData,
    fetchFromApi: fetchData,
    requestViaSocket: async () => {},
  }
}
