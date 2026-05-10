import http from "../01_axios"
import {
  apiDeleteAccount,
  apiDeleteGroupAccount,
  apiDeleteMember,
  apiDeleteMemberGroup,
  apiExportAccountMember,
  apiExportUser,
  apiGetAccount,
  apiGetAccountFather,
  apiGetAllMember,
  apiGetAllNoneAccountUser,
  apiGetChildAccountByParentID,
  apiGetGroupAccount,
  apiGetListMemberByAccount,
  apiGetListMemberForGroup,
  apiInsertAccount,
  apiInsertGroupAccount,
  apiInsertMember,
  apiInsertMemberToGroup,
  apiResetPassword,
  apiUpdateByAccountID,
  apiUpdateGroupAccount,
  apiUpdateMember,
  apiUpdateSortOrder,
} from "./urls" // Đảm bảo tệp này chứa các hằng số API Account

const getAccount = body => http.post(apiGetAccount, body)
const getListMemberByAccount = body =>
  http.post(apiGetListMemberByAccount, body)
const getChildAccountByParentID = params =>
  http.get(apiGetChildAccountByParentID, { params })
const updateByAccountID = body => http.post(apiUpdateByAccountID, body)
const insertAccount = body => http.post(apiInsertAccount, body)
const deleteAccount = body => http.post(apiDeleteAccount, body) // Thường xóa nhiều đơn vị là POST với body chứa ID
const getGroupAccount = body => http.post(apiGetGroupAccount, body)
const insertGroupAccount = body => http.post(apiInsertGroupAccount, body)
const updateGroupAccount = body => http.post(apiUpdateGroupAccount, body)
const deleteGroupAccount = body => http.post(apiDeleteGroupAccount, body) // Thường xóa nhiều nhóm là POST với body chứa ID
const getAllMember = body => http.post(apiGetAllMember, body)
const insertMember = body => http.post(apiInsertMember, body)
const updateMember = body => http.post(apiUpdateMember, body)
const deleteMember = body => http.post(apiDeleteMember, body) // Thường xóa nhiều thành viên là POST với body chứa ID
const getListMemberForGroup = body => http.post(apiGetListMemberForGroup, body)
const insertMemberToGroup = body => http.post(apiInsertMemberToGroup, body)
const deleteMemberGroup = body => http.post(apiDeleteMemberGroup, body) // Thường xóa nhiều thành viên khỏi nhóm là POST với body chứa ID
const updateSortOrder = body => http.post(apiUpdateSortOrder, body)
const exportUser = body => http.post(apiExportUser, body)
const exportAccountMember = body => http.post(apiExportAccountMember, body)
const getAccountFather = params => http.get(apiGetAccountFather, { params })
const resetPassword = body => http.patch(apiResetPassword, body) // Reset password thường dùng PATCH
const getAllNoneAccountUser = params =>
  http.get(apiGetAllNoneAccountUser, { params })

const AccountService = {
  getAccount,
  getListMemberByAccount,
  getChildAccountByParentID,
  updateByAccountID,
  insertAccount,
  deleteAccount,
  getGroupAccount,
  insertGroupAccount,
  updateGroupAccount,
  deleteGroupAccount,
  getAllMember,
  insertMember,
  updateMember,
  deleteMember,
  getListMemberForGroup,
  insertMemberToGroup,
  deleteMemberGroup,
  updateSortOrder,
  exportUser,
  exportAccountMember,
  getAccountFather,
  resetPassword,
  getAllNoneAccountUser,
}

export default AccountService
