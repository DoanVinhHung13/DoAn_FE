import STORAGE, { deleteStorage } from "src/lib/storage"
import ROUTER from "src/router/ROUTER"
import authSession from "src/services/core/authSession"
import notice from "../../components/Notice"
const isPlainObject = value => value?.constructor === Object

const BASE_URL = import.meta.env.VITE_REACT_APP_API_ROOT

export async function fetcher(initFetcher) {
  try {
    const { isNotice = true } = initFetcher
    let initOptions = initFetcher.init
    if (initOptions?.body) {
      if (Array.isArray(initOptions.body) || isPlainObject(initOptions.body)) {
        initOptions = {
          ...initOptions,
          method: (initOptions.method || "get").toUpperCase(),
          body:
            typeof initOptions?.body === "object"
              ? JSON.stringify(initOptions?.body)
              : undefined,
          headers: {
            "Content-Type": "application/json",
            ...initOptions.headers,
          },
        }
      }
    }

    const res = await fetch(`${BASE_URL}/${initFetcher.input}`, initOptions)

    if (!res.ok) {
      //   const err = new ResponseError("Bad response", res)
      handleError(res.status, isNotice)
      return res.json()
    } else {
      const responseConvert = await res.json()
      handleOk(responseConvert, isNotice)
      return responseConvert
    }
  } catch (error) {
    notice({
      msg: `Hệ thống đang tạm thời gián đoạn. Xin vui lòng trở lại sau hoặc thông báo với ban quản trị để được hỗ trợ `,
      isSuccess: false,
    })
    console.log("error", error)
  }
}

export function handleError(status, isNotice = true) {
  switch (status) {
    case 401:
      notice({
        msg: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
        isSuccess: false,
      })
      deleteStorage(STORAGE.TOKEN)
      authSession.clearSession()
      window.location.replace(ROUTER.DANG_NHAP)
      break
    case 500:
      !!isNotice &&
        notice({
          msg: `Hệ thống đang tạm thời gián đoạn. Xin vui lòng trở lại sau hoặc thông báo với ban quản trị để được hỗ trợ `,
          isSuccess: false,
        })
      break
    case 404: //không tìm thấy
      !!isNotice &&
        notice({
          msg: `Không tìm thấy API [404]`,
          isSuccess: false,
        })
      break
    case 405:
      !!isNotice &&
        notice({
          msg: `Method Not Allowed [405]`,
          isSuccess: false,
        })
      break
    default:
      !!isNotice &&
        notice({
          msg: `Lỗi không xác định!`,
          isSuccess: false,
        })
      break
  }
}

export function handleOk(response, isNotice = true) {
  if (response.StatusCode !== 200) {
    switch (response.StatusCode) {
      case 400:
        !!isNotice &&
          notice({
            msg: response?.Object,
            isSuccess: false,
          })
        break
      default:
        handleError(response.StatusCode)
        break
    }
  }
}
