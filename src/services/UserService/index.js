import http from '../01_axios'
import {
  apiGetUserInfo,
  apiGetUsers,
  apiCreateUser,
  apiBulkImportUsers,
  apiUpdateProfile,
  apiGetUserById,
  apiUpdateUser,
  apiDeleteUser,
  apiChangeUserPassword,
  apiToggleUserStatus,
} from './urls'

const getInforUser = () => http.get(apiGetUserInfo)
const getUsers = (params) => http.get(apiGetUsers, { params })
const createUser = (body) => http.post(apiCreateUser, body)
const bulkImportUsers = (body) => http.post(apiBulkImportUsers, body)
const updateProfile = (body) => http.put(apiUpdateProfile, body)
const getUserById = (id) => http.get(apiGetUserById(id))
const updateUser = (id, body) => http.put(apiUpdateUser(id), body)
const deleteUser = (id) => http.delete(apiDeleteUser(id))
const changeUserPassword = (id, body) => http.put(apiChangeUserPassword(id), body)
const toggleUserStatus = (id, body) => http.patch(apiToggleUserStatus(id), body)

const UserService = {
  getInforUser,
  getUsers,
  createUser,
  bulkImportUsers,
  updateProfile,
  getUserById,
  updateUser,
  deleteUser,
  changeUserPassword,
  toggleUserStatus,
}

export default UserService
