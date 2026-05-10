import axios from "axios"
import notice from "src/components/Notice"
import STORAGE, { getStorage } from "src/lib/storage"
import { getMsgClient } from "src/lib/stringsUtils"
import { trimData } from "src/lib/utils"
import ROUTER from "src/router/ROUTER"
import authSession from "src/services/core/authSession"

const AUTH_LOGIN_REDIRECT = `${ROUTER.HOME}?auth=login`

const getApiMessage = payload => {
  if (!payload) return ""
  if (typeof payload === "string") return payload
  if (Array.isArray(payload?.messages)) return payload.messages.filter(Boolean).join(", ")
  return (
    payload?.Object ||
    payload?.object ||
    payload?.Message ||
    payload?.message ||
    payload?.error ||
    ""
  )
}

const isBusinessSuccess = payload =>
  payload?.Status === 0 ||
  payload?.Status === 1 ||
  payload?.StatusCode === 200 ||
  payload?.success === true

const maybeNotifyFromPayload = (payload, isSuccessFallback = false) => {
  const msg = getApiMessage(payload)
  if (!msg) return
  notice({
    msg,
    isSuccess: typeof isSuccessFallback === "boolean" ? isSuccessFallback : false,
  })
}

// const baseURL = import.meta.env.VITE_VITE_BACKEND_URL!
/**
 *
 * parse error response
 */
function parseError(messages) {
  // error
  if (messages) {
    if (messages instanceof Array) {
      return Promise.reject({ messages })
    }
    return Promise.reject({ messages: [messages] })
  }
  return Promise.reject({ messages: ["Server quá tải"] })
}

/**
 * parse response
 */

export function parseBody(response) {
  const resData = response.data
  if (response?.status === 200) {
    if (resData?.StatusCode === 401) {
      maybeNotifyFromPayload(resData, false)
      authSession.clearSession()
      window.location.replace(AUTH_LOGIN_REDIRECT)
      return Promise.reject({ messages: ["Unauthorized"] })
    }
    const normalized = {
      ...resData,
      object: getMsgClient(getApiMessage(resData)?.replace?.("[MessageForUser]", "") || ""),
    }
    maybeNotifyFromPayload(normalized, isBusinessSuccess(normalized))
    return resData
  }
  return parseError(resData?.messages)
}

/**
 * axios instance
 */
// const baseURL = ''
const instance = axios.create({
  // baseURL: baseURL,
  timeout: 60000,
  headers: {
    // "Content-Type": "application/json",
    accept: "application/json, text/plain, */*",
  },
  withCredentials: true, // to send cookie
})

const pendingRequests = new Map()
let isRefreshing = false
let refreshSubscribers = []

const addSubscriber = callback => {
  refreshSubscribers.push(callback)
}

const onTokenRefreshed = newToken => {
  refreshSubscribers.forEach(callback => callback(newToken))
  refreshSubscribers = []
}

const getRequestKey = config =>
  [config.method, config.baseURL, config.url, JSON.stringify(config.params || {})].join("|")

const removePendingRequest = config => {
  const key = getRequestKey(config)
  if (pendingRequests.has(key)) {
    const controller = pendingRequests.get(key)
    controller.abort()
    pendingRequests.delete(key)
  }
}
// request header
instance.interceptors.request.use(
  async config => {
    // Do something before request is sent
    // Kiểm tra url truy cập của web để config tương ứng
    const BASE_URL =
      (typeof window !== "undefined" && window.env?.API_ROOT) ||
      import.meta.env.VITE_API_ROOT
    config.params = { ...config.params }
    removePendingRequest(config)
    const controller = new AbortController()
    config.signal = controller.signal
    pendingRequests.set(getRequestKey(config), controller)
    if (config.data) {
      config.data =
        config.data instanceof FormData ? config.data : trimData(config.data)
    }
    const Authorization = getStorage(STORAGE.TOKEN) || false
    if (Authorization)
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${Authorization}`,
      }
    config.baseURL = BASE_URL
    // config.onUploadProgress = (progressEvent: any) => {
    // let percentCompleted = Math.floor(
    //   (progressEvent.loaded * 100) / progressEvent.total,
    // )
    // do whatever you like with the percentage complete
    // maybe dispatch an action that will update a progress bar or something
    // }
    return config
  },
  error => Promise.reject(error),
)
// response parse
instance.interceptors.response.use(
  response => {
    pendingRequests.delete(getRequestKey(response.config))
    return parseBody(response)
  },
  error => {
    if (error.config) {
      pendingRequests.delete(getRequestKey(error.config))
    }
    const originalRequest = error.config || {}
    const responseStatus = error?.response?.status

    const refreshEndpoint = import.meta.env.VITE_API_REFRESH_TOKEN_ENDPOINT
    const refreshToken = authSession.getRefreshToken()
    const canRefresh =
      Boolean(refreshEndpoint) &&
      Boolean(refreshToken) &&
      !originalRequest?._retry &&
      responseStatus === 401

    if (canRefresh) {
      if (isRefreshing) {
        return new Promise(resolve => {
          addSubscriber(newToken => {
            originalRequest.headers = {
              ...originalRequest.headers,
              Authorization: `Bearer ${newToken}`,
            }
            resolve(instance(originalRequest))
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      return axios
        .post(
          `${originalRequest.baseURL || import.meta.env.VITE_API_ROOT}${refreshEndpoint}`,
          { refreshToken },
        )
        .then(resp => {
          const nextToken = resp?.data?.Object?.Token || resp?.data?.token
          const nextRefresh =
            resp?.data?.Object?.RefreshToken || resp?.data?.refreshToken
          if (!nextToken) throw new Error("Refresh token failed")
          authSession.setSessionTokens({
            accessToken: nextToken,
            refreshToken: nextRefresh,
          })
          onTokenRefreshed(nextToken)
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${nextToken}`,
          }
          return instance(originalRequest)
        })
        .catch(() => {
          authSession.clearSession()
          maybeNotifyFromPayload(error?.response?.data, false)
          window.location.replace(AUTH_LOGIN_REDIRECT)
          return Promise.reject(error)
        })
        .finally(() => {
          isRefreshing = false
        })
    }

    if (error.code === "ECONNABORTED") {
      maybeNotifyFromPayload(error?.response?.data, false)
    } else if (+error?.response?.status >= 500) {
      const dataReceived = error?.response?.data
      if (dataReceived instanceof Blob) {
        const reader = new FileReader()
        reader.readAsText(dataReceived)
        reader.onload = function () {
          const dataRespone = JSON.parse(reader.result)
          maybeNotifyFromPayload(dataRespone, false)
        }
      } else maybeNotifyFromPayload(dataReceived, false)
    } else if (+error?.response?.status < 500 && +error?.response?.status !== 200) {
      maybeNotifyFromPayload(error?.response?.data, false)
    } else if (error.code === "ERR_NETWORK") {
      maybeNotifyFromPayload(error?.response?.data, false)
    } else if (typeof error.response === "undefined") {
      maybeNotifyFromPayload(error, false)
    } else if (error.response) {
      maybeNotifyFromPayload(error.response?.data, false)
      return parseError(error.response.data)
    } else maybeNotifyFromPayload(error, false)
    return Promise.reject(error)
  },
)

export default instance

export const httpGetFile = (path = "", optionalHeader = {}) =>
  instance({
    method: "GET",
    url: path,
    headers: { ...optionalHeader, Authorization: `Bearer ${getStorage(STORAGE.TOKEN)}` },
  })
