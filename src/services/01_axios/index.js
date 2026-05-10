import axios from "axios"
import notice from "src/components/Notice"
import STORAGE, { getStorage } from "src/lib/storage"
import { getMsgClient } from "src/lib/stringsUtils"
import { trimData } from "src/lib/utils"
import ROUTER from "src/router/ROUTER"
import authSession from "src/services/core/authSession"

const AUTH_LOGIN_REDIRECT = `${ROUTER.HOME}?auth=login`

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
  if (+response?.status >= 500) {
    notice({
      msg: `Hệ thống đang tạm thời gián đoạn. Xin vui lòng trở lại sau hoặc thông báo với ban quản trị để được hỗ trợ `,
      isSuccess: false,
    })
  }
  if (+response?.status < 500 && +response?.status !== 200) {
    return notice({
      msg: `Hệ thống xảy ra lỗi. Xin vui lòng trở lại sau hoặc thông báo với ban quản trị để được hỗ trợ (SC${response?.status})`,
      isSuccess: false,
    })
  }

  if (response?.status === 200) {
    if (resData?.StatusCode === 401) {
      notice({
        msg: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
        isSuccess: false,
      })
      authSession.clearSession()
      window.location.replace(AUTH_LOGIN_REDIRECT)
      return Promise.reject({ messages: ["Unauthorized"] })
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
const noticeError500 = message => {
  if (!message)
    notice({
      msg: `Hệ thống đang tạm thời gián đoạn. Xin vui lòng trở lại sau hoặc thông báo với ban quản trị để được hỗ trợ `,
      isSuccess: false,
    })
  else {
    notice({
      msg: message,
      isSuccess: false,
    })
  }
}

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
          notice({
            msg: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
            isSuccess: false,
          })
          window.location.replace(AUTH_LOGIN_REDIRECT)
          return Promise.reject(error)
        })
        .finally(() => {
          isRefreshing = false
        })
    }

    // can not connect API
    if (error.code === "ECONNABORTED") {
      notice({
        msg: "Hệ thống đang tạm thời gián đoạn. Xin vui lòng trở lại sau hoặc thông báo với ban quản trị để được hỗ trợ ",
        isSuccess: false,
      })
    } else if (+error?.response?.status >= 500) {
      //Nếu response là loại blob(thường dùng lúc xuất excel)
      //Thì phải convert về json rồi check nếu có message (ở đây là thuộc tính Object) thì thông báo mess đấy lên
      //Nếu không có message thì thông báo hệ thống gián đoạn
      const dataReceived = error?.response?.data
      if (dataReceived instanceof Blob) {
        const reader = new FileReader()
        reader.readAsText(dataReceived)
        reader.onload = function () {
          const dataRespone = JSON.parse(reader.result)
          noticeError500(dataRespone?.Object)
        }
      } else noticeError500(dataReceived?.Object)
    } else if (+error?.response?.status < 500 && +error?.response?.status !== 200) {
      notice({
        msg: `Hệ thống xảy ra lỗi. Xin vui lòng trở lại sau hoặc thông báo với ban quản trị để được hỗ trợ (SC${error?.response?.status})`,
        isSuccess: false,
      })
    } else if (error.code === "ERR_NETWORK") {
      notice({
        msg: `Hệ thống đang bị gián đoạn, vui lòng kiểm tra lại đường truyền!`,
        isSuccess: false,
      })
    } else if (typeof error.response === "undefined") {
      notice({ msg: "Không xác định", isSuccess: false })
    } else if (error.response) {
      notice({
        msg: `Hệ thống đang tạm thời gián đoạn. Xin vui lòng trở lại sau hoặc thông báo với ban quản trị để được hỗ trợ `,
        isSuccess: false,
      })
      return parseError(error.response.data)
    } else
      notice({
        msg: `Hệ thống đang tạm thời gián đoạn. Xin vui lòng trở lại sau hoặc thông báo với ban quản trị để được hỗ trợ `,
        isSuccess: false,
      })
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
