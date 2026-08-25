import { useEffect, useRef } from "react"
import { useSelector } from "react-redux"
import STORAGE, { getStorage } from "src/redux/storage"
import signalRService from "src/components/SocketWrapper"
import { logDevDiagnostic } from "src/utils/safeDiagnostic"

const RECONNECT_DELAY_MS = [0, 2000, 5000, 10000, 30000]

const RealtimeSync = () => {
  const userInfo = useSelector(state => state.appGlobal.userInfo)
  const reconnectTimer = useRef(null)

  useEffect(() => {
    const userId = userInfo?._id || userInfo?.id
    if (!userId || !getStorage(STORAGE.TOKEN)) {
      signalRService.stopConnection().catch(() => {})
      return undefined
    }

    let disposed = false
    let retryAttempt = 0
    let unsubscribeClosed = () => {}


    const invalidateNotifications = () => {
      window.dispatchEvent(new CustomEvent("app:notification-changed"))
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

        signalRService.on("notification-changed", invalidateNotifications)
        retryAttempt = 0
      } catch (error) {
        logDevDiagnostic("realtime-connect", error)
        scheduleConnect()
      }
    }

    unsubscribeClosed = signalRService.onClosed(() => {
      if (!disposed) scheduleConnect()
    })
    scheduleConnect()

    return () => {
      disposed = true
      signalRService.off("notification-changed", invalidateNotifications)
      unsubscribeClosed()
      clearTimeout(reconnectTimer.current)
      reconnectTimer.current = null
      signalRService.stopConnection().catch(() => {})
    }
  }, [userInfo?._id, userInfo?.id])

  return null
}

export default RealtimeSync
