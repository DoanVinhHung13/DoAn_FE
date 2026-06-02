// src/services/CommonService/index.js
import http from "src/services/01_axios"
import URL_COMMON from "./urls"

/**
 * CommonService — config hệ thống (dropdown, loại...).
 * TODO: Cập nhật URL_COMMON.GET_SYSTEM_KEY theo API thực tế.
 */
const CommonService = {
  /**
   * Lấy danh sách system key (dropdown config toàn app)
   * @param {string} type - e.g. "All"
   */
  getSystemKey: (type = "All") =>
    http.get(URL_COMMON.GET_SYSTEM_KEY, { params: { type } }),
}

export default CommonService
