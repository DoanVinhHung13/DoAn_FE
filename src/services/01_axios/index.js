import axios from "axios"
import notice from "src/components/Notice"
import STORAGE, { deleteStorage, getStorage } from "src/store/storage"
import { getMsgClient } from "src/lib/stringsUtils"
import { trimData } from "src/lib/utils"
import ROUTER from "src/router/ROUTER"

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
  withCredentials: false, // set true only if backend supports CORS with credentials (no wildcard origin)
})
// request header
instance.interceptors.request.use(
  async config => {
    // Do something before request is sent
    // Kiểm tra url truy cập của web để config tương ứng
    const BASE_URL =
      (typeof window !== "undefined" && window.env?.API_ROOT) ||
      import.meta.env.VITE_API_ROOT
    config.params = { ...config.params }
    if (config.data) {
      config.data =
        config.data instanceof FormData ? config.data : trimData(config.data)
    }
    let Authorization = getStorage(STORAGE.TOKEN) || false
    if (Authorization)
      config.headers = {
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
  ``,
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
  response => parseBody(response),
  error => {
    // can not connect API
    if (error.code === "ECONNABORTED") {
      notice({
        msg: "Hệ thống đang tạm thời gián đoạn. Xin vui lòng trở lại sau hoặc thông báo với ban quản trị để được hỗ trợ ",
        isSuccess: false,
      })
    } else if (+error?.response?.Status >= 500) {
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
    } else if (
      +error?.response?.Status < 500 &&
      +error?.response?.Status !== 200
    ) {
      notice({
        msg: `Hệ thống xảy ra lỗi. Xin vui lòng trở lại sau hoặc thông báo với ban quản trị để được hỗ trợ (SC${error?.response?.Status})`,
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
    headers: { ...optionalHeader },
  })
