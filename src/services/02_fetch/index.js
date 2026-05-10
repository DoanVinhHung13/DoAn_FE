import STORAGE, { deleteStorage } from "src/lib/storage"
import ROUTER from "src/router/ROUTER"
import authSession from "src/services/core/authSession"
import notice from "../../components/Notice"
const isPlainObject = value => value?.constructor === Object

const BASE_URL = import.meta.env.VITE_REACT_APP_API_ROOT

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

const notifyFromApi = (payload, isSuccess = false, isNotice = true) => {
  if (!isNotice) return
  const msg = getApiMessage(payload)
  if (!msg) return
  notice({ msg, isSuccess })
}

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
    notifyFromApi(error, false, true)
    console.log("error", error)
  }
}

export function handleError(status, isNotice = true, payload = null) {
  switch (status) {
    case 401:
      notifyFromApi(payload, false, isNotice)
      deleteStorage(STORAGE.TOKEN)
      authSession.clearSession()
      window.location.replace(`${ROUTER.HOME}?auth=login`)
      break
    default:
      notifyFromApi(payload || { message: `HTTP ${status}` }, false, isNotice)
      break
  }
}

export function handleOk(response, isNotice = true) {
  if (response.StatusCode !== 200) {
    switch (response.StatusCode) {
      case 400:
        notifyFromApi(response, false, isNotice)
        break
      default:
        handleError(response.StatusCode, isNotice, response)
        break
    }
  } else {
    notifyFromApi(response, true, isNotice)
  }
}
