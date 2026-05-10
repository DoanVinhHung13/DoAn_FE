import { useCallback, useEffect, useRef, useState } from "react"
import signalRService from "../components/SocketWrapper/index"
import Notify from "../services/Notify/index"
import STORAGE, { getStorage } from "src/lib/storage"

export const useBadgeCounts = () => {
  const [badgeCounts, setBadgeCounts] = useState({
    joinRequest: 0,
    leaveRequest: 0,
    supportRequest: 0,
    incomeAndExpenditureRequest: 0,
  })
  const [loading, setLoading] = useState(true)
  const [connectionReady, setConnectionReady] = useState(false)
  const [error, setError] = useState(null)
  const mountedRef = useRef(true)

  const updateBadgeCounts = useCallback(requestCounterData => {
    const newCounts = {
      joinRequest:
        requestCounterData.JoinRequest || requestCounterData.joinRequest || 0,
      leaveRequest:
        requestCounterData.LeaveRequest || requestCounterData.leaveRequest || 0,
      supportRequest:
        requestCounterData.SupportRequest ||
        requestCounterData.supportRequest ||
        0,
      incomeAndExpenditureRequest:
        requestCounterData.IncomeAndExpenditureRequest ||
        requestCounterData.incomeAndExpenditureRequest ||
        0,
    }
    setBadgeCounts(newCounts)
    setLoading(false)
    setError(null)
  }, [])

  const isLogin = getStorage(STORAGE.TOKEN)

  const handleSocketUpdate = useCallback(
    requestCounterData => {
      updateBadgeCounts(requestCounterData, "socket")
    },
    [updateBadgeCounts],
  )

  const fetchInitialCounts = useCallback(async () => {
    if (!mountedRef.current) return

    try {
      setLoading(true)
      setError(null)

      //-
      const response = await Notify.getRequestCounter()
      if (response?.Object) {
        updateBadgeCounts(response.Object, "api")
      } else {
        if (
          response &&
          typeof response === "object" &&
          ("joinRequest" in response || "supportRequest" in response)
        ) {
          updateBadgeCounts(response, "api-fallback")
        } else {
          setLoading(false)
        }
      }
    } catch (error) {
      console.error("❌ Error fetching initial badge counts from API:", error)
      setError(error)
      setLoading(false)
    }
  }, [updateBadgeCounts])

  const requestCountsViaSocket = useCallback(async () => {
    if (!connectionReady) {
      return
    }

    if (!mountedRef.current) return

    try {
      await signalRService.invoke("RequestCounterUpdate")
    } catch (error) {
      console.error("❌ Error requesting badge counts via SignalR:", error)
    }
  }, [connectionReady])

  const refreshCounts = useCallback(async () => {
    if (!mountedRef.current) return

    try {
      await fetchInitialCounts()
    } catch (apiError) {
      if (connectionReady) {
        await requestCountsViaSocket()
      } else {
        setError(apiError)
      }
    }
  }, [fetchInitialCounts, requestCountsViaSocket, connectionReady])

  useEffect(() => {
    mountedRef.current = true

    const initSignalR = async () => {
      try {
        await signalRService.startConnection()

        if (!mountedRef.current) return

        signalRService.on("Request_Counter", handleSocketUpdate)
        setConnectionReady(true)
      } catch (error) {
        console.error(" SignalR connection failed:", error)
        if (mountedRef.current) {
          fetchInitialCounts()
        }
      }
    }

    initSignalR()

    return () => {
      mountedRef.current = false
      setConnectionReady(false)
      try {
        signalRService.off("Request_Counter", handleSocketUpdate)
      } catch (error) {
        console.error("Error removing SignalR listener:", error)
      }
    }
  }, [])

  useEffect(() => {
    if(isLogin) fetchInitialCounts()
  }, [])

  // Retry mechanism
  useEffect(() => {
    if (loading && error && !connectionReady && mountedRef.current) {
      const retryTimer = setTimeout(() => {
        refreshCounts()
      }, 3000)

      return () => {
        clearTimeout(retryTimer)
      }
    }
  }, [loading, error, connectionReady])

  useEffect(() => {
    if (connectionReady && error && mountedRef.current) {
      requestCountsViaSocket()
    }
  }, [connectionReady, error])

  useEffect(() => {}, [badgeCounts])

  return {
    badgeCounts,
    loading,
    error,
    refreshCounts,
    connectionReady,
    fetchFromApi: fetchInitialCounts,
    requestViaSocket: requestCountsViaSocket,
  }
}
