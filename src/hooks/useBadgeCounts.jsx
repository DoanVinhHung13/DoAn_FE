import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getNotifications } from 'src/services/NotificationService'
import STORAGE, { getStorage } from 'src/redux/storage'

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
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => normalizeNotifications(await getNotifications()),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
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
    refreshCounts: refetch,
    fetchFromApi: refetch,
    requestViaSocket: async () => {},
  }
}
