import http from "src/services/01_axios"
import URL_COMMON from "./urls"


const CommonService = {
  /**
   * Lấy danh sách system key (dropdown config toàn app)
   * @param {string} group - e.g. "all"
   */
  getSystemKey: (group) =>
    http.get(URL_COMMON.GET_SYSTEM_KEY, { params: group ? { group } : {} }),
}

export default CommonService
