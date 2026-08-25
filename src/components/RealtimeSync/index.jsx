import { useEffect, useRef } from "react"
import { useSelector } from "react-redux"
import STORAGE, { getStorage } from "src/redux/storage"
import signalRService from "src/components/SocketWrapper"
import { logDevDiagnostic } from "src/utils/safeDiagnostic"

const INVALIDATION_DELAY_MS = 150
const RECONNECT_DELAY_MS = [0, 2000, 5000, 10000, 30000]
const GROUP_MEMBERSHIP_ENTITIES = new Set([
  "CultivationLogbook",
  "CultivationLogbookFarmerAssignment",
  "CultivationTask",
  "CultivationTaskAssignee",
  "LandPlot",
  "LandPlotSupervisorAssignment",
])

const getEntityName = change => change?.entityName || change?.EntityName
const requiresGroupRefresh = change =>
  GROUP_MEMBERSHIP_ENTITIES.has(getEntityName(change))
const isFertilizerChange = payload =>
  (payload?.changes || []).some(
    change => getEntityName(change)?.toLowerCase() === "fertilizer",
  )

const RealtimeSync = () => {
  const userInfo = useSelector(state => state.appGlobal.userInfo)
  const invalidationTimer = useRef(null)
  const groupRefreshTimer = useRef(null)
  const reconnectTimer = useRef(null)

  useEffect(() => {
    const userId = userInfo?._id || userInfo?.id
    if (!userId || !getStorage(STORAGE.TOKEN)) {
      signalRService.stopConnection().catch(() => {})
      return undefined
    }

    let disposed = false
    let retryAttempt = 0
    let unsubscribeReconnect = () => {}
    let unsubscribeClosed = () => {}

    const invalidateActiveQueries = detail => {
      clearTimeout(invalidationTimer.current)
      invalidationTimer.current = setTimeout(() => {
        window.dispatchEvent(new CustomEvent("app:data-changed", { detail }))
      }, INVALIDATION_DELAY_MS)
    }

    const invalidateNotifications = () => {
      window.dispatchEvent(new CustomEvent("app:notification-changed"))
    }

    const refreshGroupsNow = () => {
      signalRService.invoke("RefreshGroups").catch(() => {})
    }

    const refreshGroups = change => {
      if (!requiresGroupRefresh(change)) return
      clearTimeout(groupRefreshTimer.current)
      groupRefreshTimer.current = setTimeout(refreshGroupsNow, 300)
    }

    const handleDataChanged = change => {
      invalidateActiveQueries()
      refreshGroups(change)
      if (isFertilizerChange(change)) {
        window.dispatchEvent(
          new CustomEvent("app:fertilizer-changed", { detail: change }),
        )
      }
    }

    const handleReconnected = () => {
      retryAttempt = 0
      invalidateActiveQueries({ reason: "reconnected" })
      refreshGroupsNow()
    }

    const scheduleConnect = () => {
      if (disposed || reconnectTimer.current || !getStorage(STORAGE.TOKEN))
        return
      const delay =
        RECONNECT_DELAY_MS[
          Math.min(retryAttempt, RECONNECT_DELAY_MS.length - 1)
        ]
      retryAttempt += 1
      reconnectTimer.current = setTimeout(() => {
        reconnectTimer.current = null
        connect()
      }, delay)
    }

    const connect = async () => {
      if (disposed || !getStorage(STORAGE.TOKEN)) return
      try {
        await signalRService.startConnection()
        if (disposed) {
          await signalRService.stopConnection()
          return
        }

        signalRService.on("data-changed", handleDataChanged)
        signalRService.on("notification-changed", invalidateNotifications)
        signalRService.on("qr-stats-updated", invalidateActiveQueries)
        retryAttempt = 0
        refreshGroupsNow()
      } catch (error) {
        logDevDiagnostic("realtime-connect", error)
        scheduleConnect()
      }
    }

    unsubscribeClosed = signalRService.onClosed(() => {
      if (!disposed) scheduleConnect()
    })
    unsubscribeReconnect = signalRService.onReconnected(handleReconnected)
    scheduleConnect()

    return () => {
      disposed = true
      signalRService.off("data-changed", handleDataChanged)
      signalRService.off("notification-changed", invalidateNotifications)
      signalRService.off("qr-stats-updated", invalidateActiveQueries)
      unsubscribeReconnect()
      unsubscribeClosed()
      clearTimeout(invalidationTimer.current)
      clearTimeout(groupRefreshTimer.current)
      clearTimeout(reconnectTimer.current)
      signalRService.stopConnection().catch(() => {})
    }
  }, [userInfo?._id, userInfo?.id])

  return null
}

export default RealtimeSync
