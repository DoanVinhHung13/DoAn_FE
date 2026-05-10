import http from "../01_axios"
import { apiGetSystemKey } from "./urls"

const getSystemKey = key =>
  http.get(
    apiGetSystemKey,
    // { params: { key } }
  )

const CommonService = { getSystemKey }
export default CommonService
