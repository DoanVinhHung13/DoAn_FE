import http from "../01_axios"
import {
  apiCreateOrUpdateRole,
  apiDeleteRole,
  apiGetAllForCombobox,
  apiGetByRoleId,
  apiGetListRole,
  apiGetListTab,
  apiGetListTask,
} from "./urls"

const getListRole = body => http.post(apiGetListRole, body)
const getByRoleId = params => http.get(apiGetByRoleId, { params })
const createOrUpdateRole = body => http.post(apiCreateOrUpdateRole, body)
const getAllForCombobox = () => http.get(apiGetAllForCombobox)
const getListTab = () => http.get(apiGetListTab)
const getListTask = () => http.get(apiGetListTask)
const deleteRole = params => http.delete(apiDeleteRole, { params })

const RoleService = {
  getListRole,
  createOrUpdateRole,
  getByRoleId,
  getAllForCombobox,
  getListTab,
  deleteRole,
  getListTask,
}
export default RoleService
