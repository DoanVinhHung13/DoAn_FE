import axios from "axios"
import notice from "src/components/Notice"
import STORAGE, {
  clearAuthStorage,
  deleteStorage,
  getStorage,
} from "src/redux/storage"
import { refreshAccessToken } from "src/services/tokenRefresh"
import { getMsgClient } from "src/utils/stringsUtils"
import { trimData } from "src/utils/helpers"
import ROUTER from "src/router/ROUTER"
import {
  getApiMessage,
  isApiError,
  isGenericApiMessage,
  normalizeApiError,
  shouldShowGlobalApiError,
} from "src/services/core/apiError"

// const baseURL = import.meta.env.VITE_VITE_BACKEND_URL!
const getEaplsMessage = getApiMessage

/** Xử lý notice cho format EAPLS { success, message, data, errors } */
const handleEaplsBody = (resData, config, status) => {
  if (typeof resData?.success !== "boolean") return resData

  const method = (config?.method || "get").toLowerCase()
  const msg = getEaplsMessage(resData)

  if (resData.success === false) {
    const shouldShowNotice =
      shouldShowGlobalApiError(
        {
          kind: "api",
          code: resData.code,
          fieldErrors: resData.fieldErrors,
        },
        config,
      ) && Boolean(msg)
    const apiError = normalizeApiError(
      {
        response: { data: resData, status },
        config,
      },
      { noticeShown: shouldShowNotice },
    )
    if (apiError.noticeShown) notice({ msg, isSuccess: false })
    return Promise.reject(apiError)
  }

  if (
    !config?.skipNotice &&
    !config?.skipSuccessNotice &&
    msg &&
    method !== "get"
  ) {
    notice({ msg, isSuccess: true })
  }

  return resData
}

const isPublicAuthUrl = (url = "") =>
  /\/auth\/(login|register|forgot-password|verify-otp|reset-password)/.test(url)

/**
 * parse response
 */
export function parseBody(response) {
  const resData = response.data
  if (+response?.status >= 500) {
    return Promise.reject(
      normalizeApiError({
        response,
        config: response.config,
      }),
    )
  }
  if (+response?.status >= 400 && +response?.status < 500) {
    return Promise.reject(
      normalizeApiError({
        response,
        config: response.config,
      }),
    )
  }

  if (+response?.status >= 200 && +response?.status < 300) {
    if (typeof resData?.success === "boolean") {
      return handleEaplsBody(resData, response.config, response.status)
    }

    if (resData?.StatusCode === 401) {
      alert("Phiên đăng nhập đã hết hạn!")
      deleteStorage(STORAGE.TOKEN)
      return window.location.replace(ROUTER.HOME)
    }
    if (resData?.Status === -2) return resData // ma sp, ten sp ton tai
    if (resData?.Status === 0) return resData // API tra ve success

    if (resData?.Status !== -1 && resData?.Status !== 69 && resData?.Object) {
      notice({
        msg: getMsgClient(resData?.Object?.replace("[MessageForUser]", "")),
        isSuccess: false,
      })
    }
    if (resData?.Status !== 1 && resData?.Object) {
      return {
        ...resData,
        object: getMsgClient(resData?.Object),
      }
    }
    return resData
  }
  return Promise.reject(
    normalizeApiError({
      response,
      config: response?.config,
    }),
  )
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
  withCredentials: false, // set true only if backend supports CORS with credentials (no wildcard origin)
})
// request header
instance.interceptors.request.use(
  async config => {
    const BASE_URL = import.meta.env.DEV
      ? "/api"
      : (typeof window !== "undefined" && window.env?.API_ROOT) ||
        import.meta.env.VITE_API_ROOT ||
        "https://api.eapls.io.vn/api"
    config.params = { ...config.params }
    if (config.data) {
      config.data =
        config.data instanceof FormData ? config.data : trimData(config.data)
    }

    const isRefreshCall = String(config.url || "").includes(
      "/auth/refresh-token",
    )
    if (!isRefreshCall && getStorage(STORAGE.TOKEN)) {
      await refreshAccessToken()
    }

    const Authorization = getStorage(STORAGE.TOKEN) || false
    if (Authorization) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${Authorization}`,
      }
    }
    config.baseURL = BASE_URL
    if (
      config.url &&
      config.url.startsWith("/api/") &&
      BASE_URL &&
      (BASE_URL.endsWith("/api") || BASE_URL.endsWith("/api/"))
    ) {
      config.url = config.url.replace(/^\/api\//, "/")
    }
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
const showApiError = error => {
  if (!error.noticeShown && shouldShowGlobalApiError(error, error.config)) {
    notice({ msg: error.message, isSuccess: false })
  }
  return error
}

// response parse
instance.interceptors.response.use(
  response => parseBody(response),
  async error => {
    if (isApiError(error)) {
      return Promise.reject(showApiError(error))
    }

    const originalRequest = error.config
    const errorData = error.response?.data
    const requestUrl = String(originalRequest?.url || "")

    // BE trả 4xx + body EAPLS (vd: login sai → 401 + success:false)
    if (
      errorData &&
      typeof errorData.success === "boolean" &&
      errorData.success === false
    ) {
      return Promise.reject(showApiError(normalizeApiError(error)))
    }

    const isPublicUrl =
      requestUrl.includes("/traceability") ||
      requestUrl.includes("/trace") ||
      isPublicAuthUrl(requestUrl)

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !requestUrl.includes("/auth/refresh-token") &&
      !isPublicUrl
    ) {
      if (originalRequest.skipAuthRedirect) {
        return Promise.reject(error)
      }
      originalRequest._retry = true
      const refreshed = await refreshAccessToken()
      if (refreshed) {
        const token = getStorage(STORAGE.TOKEN)
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${token}`,
        }
        return instance(originalRequest)
      }
      clearAuthStorage()
      window.location.replace(ROUTER.LOGIN)
      return Promise.reject(error)
    }

    return Promise.reject(showApiError(normalizeApiError(error)))
  },
)

export default instance
