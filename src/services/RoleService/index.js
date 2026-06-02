// src/services/RoleService/index.js
import http from "src/services/01_axios"
import URL_ROLE from "./urls"

/**
 * RoleService — quản lý phân quyền theo TabID.
 * TODO: Cập nhật URL_ROLE.GET_LIST_TAB theo API thực tế.
 * Response mong đợi: { isOk: true, Object: [{ CategoryID: 1, IsVistTab: true }, ...] }
 */
const RoleService = {
  /**
   * Lấy danh sách tab/quyền của user đang đăng nhập.
   * Kết quả được dispatch vào Redux: setListTabs(res.Object)
   */
  getListTab: () => http.get(URL_ROLE.GET_LIST_TAB),

  getList:  (params) => http.get(URL_ROLE.GET_LIST, { params }),
  create:   (body)   => http.post(URL_ROLE.CREATE, body),
  update:   (body)   => http.put(URL_ROLE.UPDATE, body),
  delete:   (id)     => http.delete(`${URL_ROLE.DELETE}/${id}`),
}

export default RoleService
