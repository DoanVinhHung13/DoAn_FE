import {
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr'
import STORAGE, { getStorage } from 'src/redux/storage'
import { refreshAccessToken } from 'src/services/tokenRefresh'

const getHubUrl = () => {
  const apiRoot =
    (typeof window !== 'undefined' && window.env?.API_ROOT) ||
    import.meta.env.VITE_API_ROOT ||
    import.meta.env.VITE_API_URL ||
    (typeof window !== 'undefined' ? window.location.origin : '')

  return `${apiRoot.replace(/\/+$/, '').replace(/\/api$/, '')}/hubs/realtime`
}

class SignalRService {
  connection = null
  startPromise = null
  reconnectListeners = new Set()
  closeListeners = new Set()

  startConnection = async () => {
    if (
      this.connection &&
      [
        HubConnectionState.Connected,
        HubConnectionState.Connecting,
        HubConnectionState.Reconnecting,
      ].includes(this.connection.state)
    ) {
      return this.connection
    }

    if (this.startPromise) return this.startPromise

    const connection = new HubConnectionBuilder()
      .withUrl(getHubUrl(), {
        accessTokenFactory: async () => {
          await refreshAccessToken()
          return getStorage(STORAGE.TOKEN)
        },
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(import.meta.env.DEV ? LogLevel.Warning : LogLevel.Error)
      .build()

    connection.onreconnecting(error => {
    if (import.meta.env.DEV) console.warn('[SignalR] reconnecting', error)
    })

    connection.onreconnected(connectionId => {
      if (import.meta.env.DEV) console.info('[SignalR] reconnected', connectionId)
      this.reconnectListeners.forEach(listener => listener())
    })

    connection.onclose(error => {
      if (this.connection === connection) this.connection = null
      if (import.meta.env.DEV && error) console.warn('[SignalR] closed', error)
      this.closeListeners.forEach(listener => listener(error))
    })

    this.connection = connection
    this.startPromise = connection
      .start()
      .then(() => connection)
      .catch(error => {
        if (this.connection === connection) this.connection = null
        throw error
      })
      .finally(() => {
        this.startPromise = null
      })

    return this.startPromise
  }

  stopConnection = async () => {
    if (!this.connection) return

    const connection = this.connection
    this.connection = null
    if (connection.state !== HubConnectionState.Disconnected) {
      await connection.stop()
    }
  }

  on = (eventName, callback) => {
    this.connection?.on(eventName, callback)
  }

  off = (eventName, callback) => {
    this.connection?.off(eventName, callback)
  }

  onReconnected = callback => {
    this.reconnectListeners.add(callback)
    return () => this.reconnectListeners.delete(callback)
  }

  onClosed = callback => {
    this.closeListeners.add(callback)
    return () => this.closeListeners.delete(callback)
  }

  invoke = (methodName, ...args) => {
    if (!this.connection) return Promise.reject(new Error('SignalR is not connected.'))
    return this.connection.invoke(methodName, ...args)
  }

  get isConnected() {
    return this.connection?.state === HubConnectionState.Connected
  }
}

export default new SignalRService()
